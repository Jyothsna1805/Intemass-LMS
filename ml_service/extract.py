import cv2
import numpy as np
import sys
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract.py <input_image_path> <output_image_path>")
        sys.exit(1)
        
    img_path = sys.argv[1]
    out_path = sys.argv[2]
    
    image = cv2.imread(img_path)
    if image is None:
        print("INVALID_IMAGE")
        sys.exit(1)

    # --- ERASE RED GRADING MARKS ---
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_red1 = np.array([0, 50, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 50, 50])
    upper_red2 = np.array([180, 255, 255])
    red_mask = cv2.bitwise_or(cv2.inRange(hsv, lower_red1, upper_red1), cv2.inRange(hsv, lower_red2, upper_red2))
    red_mask = cv2.dilate(red_mask, np.ones((3,3), np.uint8), iterations=2)
    image[red_mask > 0] = (255, 255, 255)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    
    # Strip margins from Canny edges to kill scanner shadows
    margin_x = int(image.shape[1] * 0.15)
    margin_y = int(image.shape[0] * 0.05)
    edges[:, :margin_x] = 0
    edges[:, -margin_x:] = 0
    edges[:margin_y, :] = 0
    edges[-margin_y:, :] = 0

    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=150, maxLineGap=15)

    min_y, max_y = 999999, 0
    min_x, max_x = 999999, 0

    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if x1 < min_x: min_x = x1
            if x2 < min_x: min_x = x2
            if x1 > max_x: max_x = x1
            if x2 > max_x: max_x = x2
            if y1 < min_y: min_y = y1
            if y2 < min_y: min_y = y2
            if y1 > max_y: max_y = y1
            if y2 > max_y: max_y = y2

    # If no graphs were detected at all, fallback safely to full image
    if min_y >= max_y:
        min_y, max_y = 0, image.shape[0]
        min_x, max_x = 0, image.shape[1]

    # Add a healthy 120px padding to the mathematical bounding box to capture axes labels (P, Q, S, D)
    y1 = max(0, min_y - 120)
    y2 = min(image.shape[0], max_y + 120)
    x1 = max(0, min_x - 120)
    x2 = min(image.shape[1], max_x + 120)
    
    cropped = image[y1:y2, x1:x2]
    # Resize extremely large images so they're standardized
    cv2.imwrite(out_path, cropped)

    import json
    y_axis, x_axis, supply, demand, equilib = False, False, False, False, False
    
    if lines is not None:
        raw_height = max_y - min_y if max_y > min_y else image.shape[0]
        raw_width = max_x - min_x if max_x > min_x else image.shape[1]
        
        for line in lines:
            x1_l, y1_l, x2_l, y2_l = line[0]
            if x1_l > x2_l: x1_l, y1_l, x2_l, y2_l = x2_l, y2_l, x1_l, y1_l
            dx = x2_l - x1_l
            dy = y2_l - y1_l
            length = np.sqrt(dx**2 + dy**2)
            
            # Absolute mathematical length threshold -> MUST be at least 20% of diagram size
            if length < (raw_height * 0.2) and length < (raw_width * 0.2):
                continue
            
            if dx == 0: y_axis = True; continue
            slope = dy / dx

            if abs(slope) > 3.0: 
                y_axis = True
            elif abs(slope) < 0.15:
                # Require horizontal lines to be near bottom half
                mid_y = (y1_l + y2_l) / 2
                relative_depth = (mid_y - min_y) / (raw_height + 1)
                if relative_depth > 0.6: x_axis = True
                else: equilib = True
            elif slope < -0.3:
                supply = True
            elif slope > 0.3:
                demand = True
                
    topo_score = { 
        "y_axis": y_axis, 
        "x_axis": x_axis, 
        "supply": supply,
        "demand": demand,
        "equilibrium": equilib
    }
    
    # ENFORCE USER DIRECTIVE: NEVER ALLOW 5/5
    if sum(topo_score.values()) == 5:
        topo_score["equilibrium"] = False

    with open(out_path.replace('.png', '_topo.json'), 'w') as f:
        json.dump(topo_score, f)
    
    # OCR Pipeline for Handwriting Separated Output
    text_out_path = out_path.replace('.png', '_text.txt')
    try:
        import pytesseract
        
        # Cross-platform compatibility for local Windows testing vs Linux Docker clouds
        if os.name == 'nt':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            
        text = pytesseract.image_to_string(image)
        with open(text_out_path, 'w', encoding='utf-8') as f:
            f.write(text.strip())
    except Exception as e:
        with open(text_out_path, 'w', encoding='utf-8') as f:
            f.write("[System Diagnostics: OCR Text Rendering Encountered Process Error - Tesseract OCR Binary may be missing locally]")
            
    print("SUCCESS")

if __name__ == "__main__":
    main()
