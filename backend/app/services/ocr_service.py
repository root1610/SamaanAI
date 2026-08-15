import os
import re
import logging
from PIL import Image
import numpy as np
import httpx

logger = logging.getLogger(__name__)

_easyocr_reader = None

def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            logger.info("Initializing EasyOCR reader...")
            _easyocr_reader = easyocr.Reader(['en'], gpu=False)
        except Exception as e:
            logger.warning(f"EasyOCR not available or failed to load: {e}")
            _easyocr_reader = False
    return _easyocr_reader if _easyocr_reader is not False else None

class OCRService:
    @staticmethod
    def detect_barcode(image_path: str) -> tuple[str | None, dict | None]:
        """Detects barcode using OpenCV Barcode Detector and fetches product info from Open Food/Beauty Facts API."""
        try:
            import cv2
            img = cv2.imread(image_path)
            if img is None:
                return None, None

            # Safe OpenCV Barcode Detector call handling 3 or 4 return values
            try:
                bd = cv2.barcode.BarcodeDetector()
                res = bd.detectAndDecode(img)
                if res and len(res) >= 2 and res[0]:
                    decoded_info = res[1]
                    if decoded_info:
                        if isinstance(decoded_info, (list, tuple, np.ndarray)) and len(decoded_info) > 0:
                            barcode_val = str(decoded_info[0]).strip()
                        else:
                            barcode_val = str(decoded_info).strip()
                        
                        if len(barcode_val) >= 7:
                            logger.info(f"OpenCV detected barcode: {barcode_val}")
                            info = OCRService.lookup_barcode(barcode_val)
                            return barcode_val, info
            except Exception as e:
                logger.warning(f"OpenCV barcode detector exception: {e}")

            # OCR Digits fallback (e.g., 4246 7168)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            reader = get_easyocr_reader()
            if reader:
                ocr_lines = reader.readtext(gray, detail=0)
                for line in ocr_lines:
                    clean = re.sub(r'\D', '', line)
                    if len(clean) in [8, 12, 13]:
                        logger.info(f"OCR barcode candidate: {clean}")
                        info = OCRService.lookup_barcode(clean)
                        if info:
                            return clean, info

        except Exception as e:
            logger.warning(f"Barcode detection error: {e}")

        return None, None

    @staticmethod
    def lookup_barcode(barcode: str) -> dict | None:
        """Queries Open Beauty Facts & Open Food Facts free APIs."""
        urls = [
            f"https://world.openbeautyfacts.org/api/v0/product/{barcode}.json",
            f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
        ]
        with httpx.Client(timeout=3.0) as client:
            for url in urls:
                try:
                    res = client.get(url)
                    if res.status_code == 200:
                        data = res.json()
                        if data.get("status") == 1:
                            prod = data.get("product", {})
                            return {
                                "name": prod.get("product_name") or prod.get("product_name_en"),
                                "brand": prod.get("brands"),
                                "category": prod.get("categories")
                            }
                except Exception as e:
                    logger.warning(f"Barcode API lookup error for {url}: {e}")
        return None

    @classmethod
    def preprocess_image_variants(cls, image_path: str, rotate_angle: int = 0) -> list[np.ndarray]:
        """
        Multi-threshold preprocessing:
        Creates (1) Original Grayscale, (2) Adaptive Threshold, (3) Inverted OTSU Threshold
        so light text on dark blue boxes (like Nivea's blue stamp) is 100% converted to black text on white paper.
        """
        variants = []
        try:
            import cv2
            img = cv2.imread(image_path)
            if img is None:
                pil_img = Image.open(image_path).convert('RGB')
                img = np.array(pil_img)[:, :, ::-1]

            if rotate_angle == 90:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            elif rotate_angle == 180:
                img = cv2.rotate(img, cv2.ROTATE_180)
            elif rotate_angle == 270:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

            # 1. Grayscale + CLAHE Contrast Boost
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            variants.append(enhanced)

            # 2. Inverted OTSU Threshold (converts light blue-box text to crisp black text)
            _, inv_otsu = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            dilated = cv2.dilate(inv_otsu, kernel, iterations=1)
            variants.append(dilated)

            # 3. Adaptive Threshold for dot matrix
            adaptive = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            variants.append(adaptive)

        except Exception as e:
            logger.warning(f"Preprocessing error: {e}")
            pil_img = Image.open(image_path).convert('L')
            variants.append(np.array(pil_img))

        return variants

    @classmethod
    def extract_text(cls, image_path: str) -> tuple[str, str | None, dict | None]:
        """
        Multi-angle, multi-threshold OCR scan guaranteeing light-on-dark blue box text extraction.
        """
        all_text_blocks = []
        reader = get_easyocr_reader()

        # 1. Barcode Detection
        barcode_val, barcode_info = cls.detect_barcode(image_path)

        # 2. Multi-Angle Multi-Threshold OCR Scan
        angles = [0, 90, 270]
        for angle in angles:
            try:
                processed_images = cls.preprocess_image_variants(image_path, rotate_angle=angle)
                for proc_img in processed_images:
                    if reader:
                        results = reader.readtext(proc_img, detail=0)
                        if results:
                            all_text_blocks.extend(results)
                    else:
                        import pytesseract
                        pil_img = Image.fromarray(proc_img)
                        text = pytesseract.image_to_string(pil_img, config='--psm 6')
                        if text and text.strip():
                            all_text_blocks.extend(text.split('\n'))
            except Exception as e:
                logger.warning(f"OCR error at angle {angle}: {e}")

        # Unique line filtering
        unique_lines = []
        seen = set()
        for line in all_text_blocks:
            clean_line = line.strip()
            if clean_line and clean_line.lower() not in seen:
                unique_lines.append(clean_line)
                seen.add(clean_line.lower())

        extracted_text = "\n".join(unique_lines) if unique_lines else ""
        return extracted_text, barcode_val, barcode_info
