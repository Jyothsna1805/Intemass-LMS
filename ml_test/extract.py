import cv2
import numpy as np
import sys
import os

img_path = r'c:\Users\user\.gemini\antigravity\brain\33a00cf4-06e3-45f5-baef-37ee5ab793e0\media__1777018952598.png'
out_dir = r'c:\Users\user\.gemini\antigravity\brain\33a00cf4-06e3-45f5-baef-37ee5ab793e0'

image = cv2.imread(img_path)
if image is None:
    print("Could not load image.")
    sys.exit(1)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5,5), 0)

# Extract binary ink map
thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 5)

# Connect strong lines (axes, curves)
kernel = np.ones((25, 25), np.uint8)
closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

min_x, min_y = float('inf'), float('inf')
max_x, max_y = 0, 0

found = False
for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    area = w * h
    
    # Graphs are large contiguous drawings
    if w > 150 and h > 150 and area > 40000:
        aspect_ratio = float(w) / h
        if 0.3 < aspect_ratio < 3.0:
            found = True
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x + w)
            max_y = max(max_y, y + h)

annotated = image.copy()

if found:
    # Tight crop without padding to avoid surrounding text paragraphs
    cv2.rectangle(annotated, (min_x, min_y), (max_x, max_y), (0, 255, 0), 4)
    cropped = image[min_y:max_y, min_x:max_x]
    
    cv2.imwrite(os.path.join(out_dir, 'extracted_graph_combined.png'), cropped)
    print("Extraction successful! Saved exactly 1 combined graph image.")
else:
    print("No graphs found.")

cv2.imwrite(os.path.join(out_dir, 'annotated_result.png'), annotated)
