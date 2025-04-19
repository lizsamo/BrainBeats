import pdfplumber
import easyocr
import pytesseract
import docx
import sys
import os
import cv2
import numpy as np
from PIL import Image

# Path to Tesseract
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

        # Sharpen
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        sharpen_kernel = np.array([[-1, -1, -1],
                                   [-1, 9, -1],
                                   [-1, -1, -1]])
        sharpened = cv2.filter2D(blur, -1, sharpen_kernel)

        # Resize bigger for better OCR detection
        resized = cv2.resize(sharpened, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)

        # Adaptive thresholding for binarization
        enhanced = cv2.adaptiveThreshold(
            resized, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )

        temp_path = "temp_processed.png"
        cv2.imwrite(temp_path, enhanced)

        # Try EasyOCR first
        reader = easyocr.Reader(["en"], gpu=False)
        result = reader.readtext(temp_path, detail=0, paragraph=True)
        easy_text = " ".join(result)

        if not easy_text.strip() or len(easy_text.split()) < 5:
            print("[Fallback] EasyOCR was insufficient. Switching to Tesseract...")
            pil_img = Image.open(temp_path)
            text = pytesseract.image_to_string(pil_img)
            print("[Tesseract Output Preview]:", text[:500])

            if not text.strip():
                text = "[No readable text extracted by Tesseract]"
        else:
            text = easy_text

        # Comment this line if you want to inspect output image
        # os.remove(temp_path)

    elif file_path.lower().endswith(".docx"):
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])

    else:
        text = "Unsupported file type"

except Exception as e:
    text = f"Preprocessing failed: {e}"

print(text.strip().encode("utf-8", errors="replace").decode("utf-8"))
