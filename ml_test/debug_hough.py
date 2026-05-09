import cv2
import numpy as np
import sys

img = cv2.imread(sys.argv[1])
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150, apertureSize=3)

# Find long straight lines (axes and long curves)
lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=100, maxLineGap=20)

min_y = 99999
max_y = 0
min_x = 99999
max_x = 0

if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        min_x = min(min_x, x1, x2)
        max_x = max(max_x, x1, x2)
        min_y = min(min_y, y1, y2)
        max_y = max(max_y, y1, y2)

if min_x < max_x and min_y < max_y:
    print(f"Hough Bbox: y={min_y}-{max_y}, x={min_x}-{max_x}")
    # Expand by 50 pixels to catch "S" "D" and axes labels!
    y1 = max(0, min_y - 50)
    y2 = min(img.shape[0], max_y + 50)
    x1 = max(0, min_x - 50)
    x2 = min(img.shape[1], max_x + 50)
    
    out = img[y1:y2, x1:x2]
    cv2.imwrite("backend/uploads/debug_hough_crop.png", out)
    print("SAVED debug_hough_crop.png")
else:
    print("No lines detected.")
