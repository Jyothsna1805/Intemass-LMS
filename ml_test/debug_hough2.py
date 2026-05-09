import cv2
import numpy as np
import sys

img = cv2.imread(sys.argv[1])
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lower_red1, upper_red1 = np.array([0, 50, 50]), np.array([10, 255, 255])
lower_red2, upper_red2 = np.array([160, 50, 50]), np.array([180, 255, 255])
red_mask = cv2.bitwise_or(cv2.inRange(hsv, lower_red1, upper_red1), cv2.inRange(hsv, lower_red2, upper_red2))
red_mask = cv2.dilate(red_mask, np.ones((3,3), np.uint8), iterations=2)
img[red_mask > 0] = (255, 255, 255)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150, apertureSize=3)

margin_x = int(img.shape[1] * 0.15)
margin_y = int(img.shape[0] * 0.05)
edges[:, :margin_x] = 0
edges[:, -margin_x:] = 0
edges[:margin_y, :] = 0
edges[-margin_y:, :] = 0

lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=150, maxLineGap=15)

min_y, max_y = 99999, 0
min_x, max_x = 99999, 0

if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        min_x = min(min_x, x1, x2)
        max_x = max(max_x, x1, x2)
        min_y = min(min_y, y1, y2)
        max_y = max(max_y, y1, y2)

if min_x < max_x and min_y < max_y:
    print(f"Hough Bbox: y={min_y}-{max_y}, x={min_x}-{max_x}")
    # Expand by 100 pixels to catch "S" "D" and axes labels!
    y1 = max(0, min_y - 120)
    y2 = min(img.shape[0], max_y + 120)
    x1 = max(0, min_x - 120)
    x2 = min(img.shape[1], max_x + 120)
    
    out = img[y1:y2, x1:x2]
    cv2.imwrite("backend/uploads/debug_hough2_crop.png", out)
    print("SAVED debug_hough2_crop.png")
else:
    print("NO_LINES")
