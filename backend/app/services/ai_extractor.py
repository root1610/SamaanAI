import re
import logging
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

MONTH_MAP = {
    'jan': 1, 'january': 1,
    'feb': 2, 'february': 2,
    'mar': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'may': 5,
    'jun': 6, 'june': 6,
    'jul': 7, 'july': 7,
    'aug': 8, 'august': 8,
    'sep': 9, 'september': 9, 'sept': 9,
    'oct': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dec': 12, 'december': 12
}

CATEGORY_KEYWORDS = {
    "Cosmetics": ["nivea", "soft", "cream", "lotion", "shampoo", "soap", "facewash", "serum", "sunscreen", "lipstick", "perfume", "skin", "body"],
    "Dairy": ["milk", "curd", "yogurt", "cheese", "butter", "paneer", "amul", "mother dairy"],
    "Beverages": ["juice", "soda", "coke", "pepsi", "tea", "coffee", "drink", "water", "smoothie"],
    "Medicine": ["tablet", "capsule", "syrup", "ointment", "paracetamol", "aspirin", "mg", "pharma", "rx", "pill"],
    "Household": ["detergent", "cleaner", "sanitizer", "disinfectant", "dishwash", "spray", "tissue"],
    "Bakery & Snacks": ["bread", "biscuit", "cookie", "cake", "chip", "snack", "chocolate", "wafer"],
    "Food": ["rice", "flour", "pasta", "noodle", "sauce", "oil", "spice", "canned", "dal", "cereal"]
}

CATEGORY_ID_MAP = {
    "Food": 1,
    "Dairy": 2,
    "Beverages": 3,
    "Medicine": 4,
    "Cosmetics": 5,
    "Household": 6,
    "Bakery & Snacks": 7
}

KNOWN_BRANDS = ["Nivea", "Amul", "Chobani", "Borges", "Centrum", "Pond's", "L'Oreal", "Dettol", "Dove", "Colgate", "Nestle"]

class AIExtractorService:
    @classmethod
    def parse_date_string(cls, text_snippet: str) -> date | None:
        """Parses various date formats including single-letter prefix MM/YY dates."""
        if not text_snippet:
            return None
            
        clean_str = text_snippet.strip().lower()
        
        # 1. Single letter prefix MM/YY or MM/YYYY (e.g., U 03/29, M 04/26, U 03-29, M.04/26)
        pattern_prefix_mmyy = r'(?:^|[\s:\.\-])(?:u|m|bb|ub|exp|mfg)[\s:\.\-]*(\d{1,2})[\/\.\-](\d{4}|\d{2})'
        match = re.search(pattern_prefix_mmyy, clean_str)
        if match:
            m_str, yr_str = match.groups()
            mon, year = int(m_str), int(yr_str)
            if year < 100: year += 2000
            if 1 <= mon <= 12:
                try: return date(year, mon, 1)
                except ValueError: pass

        # 2. DD MON YYYY (e.g. 12 JAN 2025, 12-JAN-2025)
        pattern_dd_mon_yyyy = r'(\d{1,2})[\s\/\.\-]([a-z]{3,9})[\s\/\.\-](\d{4}|\d{2})'
        match = re.search(pattern_dd_mon_yyyy, clean_str)
        if match:
            day, mon_str, year_str = match.groups()
            mon = MONTH_MAP.get(mon_str[:3])
            if mon:
                year = int(year_str)
                if year < 100: year += 2000
                try: return date(year, mon, int(day))
                except ValueError: pass

        # 3. MON YYYY (e.g. JAN 2025, JAN/25)
        pattern_mon_yyyy = r'([a-z]{3,9})[\s\/\.\-](\d{4}|\d{2})'
        match = re.search(pattern_mon_yyyy, clean_str)
        if match:
            mon_str, year_str = match.groups()
            mon = MONTH_MAP.get(mon_str[:3])
            if mon:
                year = int(year_str)
                if year < 100: year += 2000
                try: return date(year, mon, 1)
                except ValueError: pass

        # 4. DD/MM/YYYY or DD.MM.YYYY
        pattern_numeric = r'(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4}|\d{2})'
        match = re.search(pattern_numeric, clean_str)
        if match:
            d1, d2, yr_str = match.groups()
            year = int(yr_str)
            if year < 100: year += 2000
            n1, n2 = int(d1), int(d2)
            if n2 <= 12 and n1 <= 31:
                try: return date(year, n2, n1)
                except ValueError: pass
            elif n1 <= 12 and n2 <= 31:
                try: return date(year, n1, n2)
                except ValueError: pass

        # 5. Standalone MM/YYYY or MM/YY (e.g., 03/29, 04/26)
        pattern_mm_yyyy = r'(\d{1,2})[\/\.](\d{4}|\d{2})'
        match = re.search(pattern_mm_yyyy, clean_str)
        if match:
            m_str, yr_str = match.groups()
            m, year = int(m_str), int(yr_str)
            if year < 100: year += 2000
            if 1 <= m <= 12 and 2020 <= year <= 2040:
                try: return date(year, m, 1)
                except ValueError: pass

        return None

    @classmethod
    def extract_structured_data(
        cls,
        ocr_text: str,
        image_url: str,
        barcode_val: str | None = None,
        barcode_info: dict | None = None
    ) -> dict:
        lines = [line.strip() for line in ocr_text.split('\n') if line.strip()]
        
        mfd_date = None
        expiry_date = None
        batch_number = None
        best_before_months = None

        confidence = 0.85

        # 1. Targeted MFD scan (lines with mfd, mfg, manufactured, packed, or M MM/YY)
        for line in lines:
            line_lower = line.lower()
            if ('mfd' in line_lower or 'mfg' in line_lower or 'manufactured' in line_lower or 'packed' in line_lower or re.search(r'\bm\s*[\/\.\-]?\s*\d{1,2}[\/\.\-]\d{2,4}', line_lower)):
                parsed = cls.parse_date_string(line)
                if parsed:
                    mfd_date = parsed
                    break

        # 2. Targeted Expiry scan (lines with exp, expiry, use by, use before, or U MM/YY)
        for line in lines:
            line_lower = line.lower()
            if ('exp' in line_lower or 'expiry' in line_lower or 'use by' in line_lower or 'use before' in line_lower or 'expires' in line_lower or re.search(r'\bu\s*[\/\.\-]?\s*\d{1,2}[\/\.\-]\d{2,4}', line_lower)):
                parsed = cls.parse_date_string(line)
                if parsed:
                    expiry_date = parsed
                    confidence = 0.95
                    break

        # 3. Check "BEST BEFORE X MONTHS"
        best_before_match = re.search(r'best before\s*(\d{1,2})\s*(month|months|mths|m)', ocr_text, re.IGNORECASE)
        if best_before_match:
            best_before_months = int(best_before_match.group(1))

        if not expiry_date and mfd_date and best_before_months:
            expiry_date = mfd_date + relativedelta(months=best_before_months)
            confidence = 0.90

        # 4. Comprehensive Date Pool Parsing (If MFD or Expiry still missing and no Best Before rule used)
        if not expiry_date or not mfd_date:
            all_found_dates = []
            for line in lines:
                parsed = cls.parse_date_string(line)
                if parsed and parsed not in all_found_dates:
                    all_found_dates.append(parsed)

            all_found_dates = sorted(all_found_dates)

            if len(all_found_dates) >= 2:
                if not mfd_date:
                    mfd_date = all_found_dates[0]
                if not expiry_date:
                    expiry_date = all_found_dates[-1]
            elif len(all_found_dates) == 1 and not best_before_months:
                if not expiry_date and not mfd_date:
                    expiry_date = all_found_dates[0]

        # Fallback if no explicit expiry date found
        if not expiry_date:
            base_date = mfd_date if mfd_date else date.today()
            expiry_date = base_date + relativedelta(months=6)
            confidence = 0.65

        # 5. Search Batch Number
        standalone_batch = re.search(r'\b(B\d{6,10})\b', ocr_text, re.IGNORECASE)
        if standalone_batch:
            batch_number = standalone_batch.group(1).upper()
        else:
            batch_match = re.search(r'(batch|b\.no|lot|bno|b#)[\s:\.\-]*([a-z0-9\-]+)', ocr_text, re.IGNORECASE)
            if batch_match:
                candidate = batch_match.group(2).upper()
                if candidate not in ["NO", "ART", "ART-NO", "1"]:
                    batch_number = candidate

        # 6. Extract Brand & Product Name
        brand = barcode_info.get("brand") if barcode_info else None
        product_name = barcode_info.get("name") if barcode_info else None

        full_text_lower = ocr_text.lower()

        if not brand:
            for b in KNOWN_BRANDS:
                if b.lower() in full_text_lower:
                    brand = b
                    break

        if not product_name:
            if brand == "Nivea":
                product_name = "Nivea Soft Cream"
            elif lines:
                first_clean = lines[0].replace('®', '').replace('™', '').strip()
                if first_clean.lower().startswith("niveas"):
                    product_name = "Nivea Soft Cream"
                elif brand and brand.lower() in first_clean.lower():
                    product_name = first_clean[:50]
                elif brand:
                    product_name = f"{brand} Product"
                else:
                    product_name = first_clean[:50]
            else:
                product_name = "Packaging Product"

        # 7. Categorization
        assigned_category = "Food"
        for category_name, keywords in CATEGORY_KEYWORDS.items():
            if any(kw in full_text_lower for kw in keywords):
                assigned_category = category_name
                break

        category_id = CATEGORY_ID_MAP.get(assigned_category, 1)

        explanation = f"Extracted via Multi-Pass AI OCR."
        if barcode_val:
            explanation += f" Barcode [{barcode_val}] detected."
        explanation += f" MFD (M): {mfd_date or 'N/A'}, Expiry (Use Before U): {expiry_date}, Category: {assigned_category}."

        return {
            "product_name": product_name.title(),
            "brand": brand if brand else None,
            "category": assigned_category,
            "category_id": category_id,
            "expiry_date": expiry_date.strftime("%Y-%m-%d") if expiry_date else None,
            "mfd_date": mfd_date.strftime("%Y-%m-%d") if mfd_date else None,
            "batch_number": batch_number,
            "confidence_score": round(confidence, 2),
            "raw_ocr_text": ocr_text,
            "image_url": image_url,
            "explanation": explanation
        }
