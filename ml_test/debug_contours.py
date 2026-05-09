import cv2
import sys

img = cv2.imread(sys.argv[1])
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 6)

margin_x = int(img.shape[1] * 0.15)
margin_y = int(img.shape[0] * 0.05)
thresh[:, :margin_x] = 0
thresh[:, -margin_x:] = 0
thresh[:margin_y, :] = 0
thresh[-margin_y:, :] = 0

contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

min_y, max_y = 99999, 0
min_x, max_x = 99999, 0

for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    area = w * h
    if area > 10000: # Filter out text characters
        if y < min_y: min_y = y
        if y+h > max_y: max_y = y+h
        if x < min_x: min_x = x
        if x+w > max_x: max_x = x+w

print(f"Bbox: y={min_y}-{max_y}, x={min_x}-{max_x}")
if min_y < max_y:
    out = img[max(0, min_y-20):min(img.shape[0], max_y+20), max(0, min_x-20):min(img.shape[1], max_x+20)]
    cv2.imwrite("backend/uploads/debug_crop2.png", out)
    print("SAVED debug_crop2.png")
