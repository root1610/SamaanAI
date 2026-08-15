from datetime import date
from app.services.ai_extractor import AIExtractorService

def test_mfd_plus_best_before_months():
    ocr_text = """
    AMUL TAAZA TONED MILK
    MFD: 10 JAN 2025
    BEST BEFORE 6 MONTHS
    BATCH: AMUL001
    """
    res = AIExtractorService.extract_structured_data(ocr_text, "/static/uploads/test.jpg")
    
    assert res["product_name"] == "Amul Taaza Toned Milk"
    assert res["mfd_date"] == "2025-01-10"
    assert res["expiry_date"] == "2025-07-10"
    assert res["batch_number"] == "AMUL001"
    assert res["category"] == "Dairy"
    assert res["confidence_score"] >= 0.85

def test_direct_exp_date():
    ocr_text = """
    PARACETAMOL 500MG TABLETS
    MFG: 01/2024
    EXP: 12/2026
    LOT: PX9921
    """
    res = AIExtractorService.extract_structured_data(ocr_text, "/static/uploads/med.jpg")
    
    assert "Paracetamol" in res["product_name"]
    assert res["expiry_date"] == "2026-12-01"
    assert res["category"] == "Medicine"
    assert res["confidence_score"] >= 0.90

def test_single_letter_u_and_m_nivea_format():
    ocr_text = """
    NIVEA Soft
    MFD (M) and Use Before (U)
    B61451450 03
    M 04/26 07:34
    U 03/29
    165 3.30/ml
    """
    res = AIExtractorService.extract_structured_data(ocr_text, "/static/uploads/nivea.jpg")
    
    assert "Nivea" in res["product_name"]
    assert res["brand"] == "Nivea"
    assert res["mfd_date"] == "2026-04-01"
    assert res["expiry_date"] == "2029-03-01"
    assert res["batch_number"] == "B61451450"
    assert res["category"] == "Cosmetics"
    assert res["confidence_score"] >= 0.90
