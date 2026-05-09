import cv2
import numpy as np
import sys
import os

def main():
    if len(sys.argv) < 2:
        print("Provide image path")
        sys.exit(1)
        
    img_path = sys.argv[1]
    image = cv2.imread(img_path)
    if image is None:
        print("Cannot load image")
        sys.exit(1)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Invert so ink is white
    blur = cv2.GaussianBlur(gray, (5,5), 0)
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 6)
    
    # Calculate horizontal projection profile
    row_sums = np.sum(thresh, axis=1) / 255.0  # Number of white pixels per row
    
    # Smooth to avoid breaking blocks over 1-pixel false gaps in drawn lines
    kernel_size = 8
    smoothed = np.convolve(row_sums, np.ones(kernel_size)/kernel_size, mode='same')
    
    threshold_val = 3.0 # if a row has effectively less than 3 pixels of ink, it's empty
    
    blocks = []
    in_block = False
    start_y = 0
    
    for y in range(len(smoothed)):
        if smoothed[y] > threshold_val and not in_block:
            in_block = True
            start_y = y
        elif smoothed[y] <= threshold_val and in_block:
            in_block = False
            end_y = y
            if end_y - start_y > 15: # Ignore random 15px tall specs
                blocks.append((start_y, end_y))
                
    if in_block:
        if (len(smoothed) - 1) - start_y > 15:
            blocks.append((start_y, len(smoothed) - 1))
            
    print(f"Total blocks found: {len(blocks)}")
    
    # Find the tallest block. Graphs are significantly taller than 1 or 2 lines of text!
    if not blocks:
        print("No blocks found.")
        sys.exit(0)
        
    tallest_block = max(blocks, key=lambda b: b[1] - b[0])
    print(f"Tallest block (graph): Starts at {tallest_block[0]}, Ends at {tallest_block[1]}, Height {tallest_block[1] - tallest_block[0]}")
    
    # We can also dynamically tighten X bounds. 
    # Just take the ink inside the tallest_block bounded y region, and find min_x and max_x
    graph_thresh = thresh[tallest_block[0]:tallest_block[1], :]
    col_sums = np.sum(graph_thresh, axis=0) / 255.0
    
    col_smoothed = np.convolve(col_sums, np.ones(5)/5, mode='same')
    active_cols = np.where(col_smoothed > 1.0)[0]
    
    if len(active_cols) > 0:
        min_x = active_cols[0]
        max_x = active_cols[-1]
    else:
        min_x = 0
        max_x = image.shape[1]
        
    print(f"X Bounds: min_x {min_x}, max_x {max_x}")
    
    # Use padding for safety
    y1 = max(0, tallest_block[0] - 10)
    y2 = min(image.shape[0], tallest_block[1] + 10)
    x1 = max(0, min_x - 10)
    x2 = min(image.shape[1], max_x + 10)

    print("Shape of original:", image.shape)
    
    cropped = image[y1:y2, x1:x2]
    out_path = os.path.join(os.path.dirname(img_path), "test_projection_crop.png")
    cv2.imwrite(out_path, cropped)
    print(f"Saved cropped to {out_path} with shape {cropped.shape}")

if __name__ == "__main__":
    main()
