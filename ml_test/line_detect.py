import cv2
import numpy as np
import sys
import json

def analyze_graph(img_path):
    image = cv2.imread(img_path)
    if image is None:
        return {"error": "Invalid image"}

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Use Canny edge detection
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    
    # Use Probabilistic Hough Line Transform to find lines
    # Using parameters tuned for hand-drawn lines
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=50, maxLineGap=20)
    
    # We want to group similar lines because a single hand-drawn stroke might be detected as multiple small lines
    # A simple way to group is by angle and position, or just counting heavily separated line clusters.
    # For a proof-of-concept, we can just do contour detection on dilated edges to find distinct strokes.
    
    kernel = np.ones((10, 10), np.uint8)
    dilated_edges = cv2.dilate(edges, kernel, iterations=1)
    
    contours, _ = cv2.findContours(dilated_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter out tiny noise dots
    valid_strokes = [c for c in contours if cv2.contourArea(c) > 200]
    
    # Draw them for visual debug
    debug_img = image.copy()
    cv2.drawContours(debug_img, valid_strokes, -1, (0, 0, 255), 2)
    cv2.imwrite("debug_features.png", debug_img)
    
    detected_parts = len(valid_strokes)
    # The standard answer expects 5 parts (e.g. Y axis, X axis, Supply, Demand, Dotted line)
    standard_parts = 5
    
    score = min(detected_parts, standard_parts)
    
    return {
        "detected_parts": detected_parts,
        "standard_parts": standard_parts,
        "suggested_score": score,
        "raw_lines": len(lines) if lines is not None else 0
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        res = analyze_graph(sys.argv[1])
        print(json.dumps(res))
