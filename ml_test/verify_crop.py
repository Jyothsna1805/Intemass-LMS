import cv2
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def check_graph_text():
    try:
        img = cv2.imread('backend/uploads/extracted_1777125136872-871181030.png')
        if img is None:
            print("ERROR: Image not found.")
            return

        text = pytesseract.image_to_string(img)
        print("--- EXTRACTED TEXT FROM GRAPH ---")
        print(text.strip())
        print("---------------------------------")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    check_graph_text()
