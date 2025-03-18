import easyocr
import fitz  # PyMuPDF
import pandas as pd
import docx

def test_easyocr():
    try:
        reader = easyocr.Reader(["en"])
        result = reader.readtext("/mnt/data/sample_image.png")  # Use generated image file
        print("EasyOCR Test Passed. Extracted Text:", result)
    except Exception as e:
        print("EasyOCR Test Failed:", e)

def test_pymupdf():
    try:
        doc = fitz.open("/mnt/data/sample.pdf")  # Use generated PDF file
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
        doc.save("test.docx")
        print("python-docx Test Passed. Document Created.")
    except Exception as e:
        print("python-docx Test Failed:", e)

if __name__ == "__main__":
    test_easyocr()
    test_pymupdf()
    test_pandas()
    test_python_docx()
