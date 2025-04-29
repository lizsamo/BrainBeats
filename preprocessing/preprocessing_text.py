import easyocr
import fitz  # PyMuPDF
import pandas as pd
import docx
import os

# Update these file paths to match actual locations on your Windows system
image_path = r"C:\Users\lizsa\Documents\BrainBeats\sample_image.png"
pdf_path = r"C:\Users\lizsa\Documents\BrainBeats\sample.pdf"
docx_path = r"C:\Users\lizsa\Documents\BrainBeats\test.docx"

def test_easyocr():
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        reader = easyocr.Reader(["en"])
        result = reader.readtext(image_path)
        print("EasyOCR Test Passed. Extracted Text:", result)
    except Exception as e:
        print("EasyOCR Test Failed:", e)

def test_pymupdf():
    try:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        doc = fitz.open(pdf_path)
        text = "\n".join([page.get_text() for page in doc])
        print("PyMuPDF Test Passed. Extracted Text:", text[:200])  # Show first 200 chars
    except Exception as e:
        print("PyMuPDF Test Failed:", e)

def test_pandas():
    try:
        data = {"Column1": ["Data1", "Data2"], "Column2": ["Data3", "Data4"]}
        df = pd.DataFrame(data)
        print("Pandas Test Passed. DataFrame:\n", df)
    except Exception as e:
        print("Pandas Test Failed:", e)

def test_python_docx():
    try:
        doc = docx.Document()
        doc.add_paragraph("Hello, this is a test document.")
        doc.save(docx_path)
        print(f"python-docx Test Passed. Document Created at {docx_path}")
    except Exception as e:
        print("python-docx Test Failed:", e)

if __name__ == "__main__":
    test_easyocr()
    test_pymupdf()
    test_pandas()
    test_python_docx()
