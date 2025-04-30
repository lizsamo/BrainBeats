import pdfplumber
import easyocr
import pytesseract
import docx
import sys
import os
import re
import cv2
import numpy as np
from PIL import Image

# Path to Tesseract — still used for PDFs
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

file_path = sys.argv[1] if len(sys.argv) > 1 else ""
text = ""

try:
    if file_path.lower().endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

    elif file_path.lower().endswith((".jpg", ".jpeg", ".png")):
        image = cv2.imread(file_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (3, 3), 0)

        sharpen_kernel = np.array([[-1, -1, -1],
                                   [-1,  9, -1],
                                   [-1, -1, -1]])
        sharpened = cv2.filter2D(blur, -1, sharpen_kernel)
        resized = cv2.resize(sharpened, None, fx=3.0, fy=3.0, interpolation=cv2.INTER_LINEAR)
        contrasted = cv2.convertScaleAbs(resized, alpha=1.5, beta=0)

        enhanced = cv2.adaptiveThreshold(
            contrasted, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 15, 10
        )

        temp_path = "temp_processed.png"
        cv2.imwrite(temp_path, enhanced)

        reader = easyocr.Reader(["en"], gpu=False)
        result = reader.readtext(temp_path, detail=0, paragraph=True)
        easy_text = " ".join(result)
        text = easy_text if easy_text.strip() else "[No readable text extracted]"

    elif file_path.lower().endswith(".docx"):
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])

    else:
        text = "Unsupported file type"

except Exception as e:
    text = f"Preprocessing failed: {e}"

# Clean OCR output: remove junk and keep useful labels
def clean_ocr_output(raw_text):
    tokens = raw_text.split()
    cleaned = []

    for word in tokens:
        word = word.strip(",.;:!?|")

        if any(s in word.lower() for s in ["www", ".com", "http", "%", "=", "#", "\\", "©"]):
            continue

        if re.match(r"^[A-Za-z]{3,}$", word):  # 3+ letter alphabetic word
            cleaned.append(word)
        elif re.match(r"^[A-Za-z0-9\+\-]{2,5}$", word):  # short alphanum tokens (ATP, F1, Na+)
            cleaned.append(word)

    return " ".join(cleaned)

final_output = clean_ocr_output(text)
print(final_output.encode("utf-8", errors="replace").decode("utf-8"))
