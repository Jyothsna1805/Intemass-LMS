import cv2
import numpy as np
import sys

img_path = sys.argv[1]
image = cv2.imread(img_path)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5,5), 0)
thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 6)

margin_x = int(image.shape[1] * 0.15)
core_thresh = thresh[:, margin_x : image.shape[1] - margin_x]

row_sums = np.sum(core_thresh, axis=1) / 255.0

def find_blocks(k_size, t_val):
    smoothed = np.convolve(row_sums, np.ones(k_size)/k_size, mode='same')
    blocks = []
    in_block = False
    start_y = 0
    for y in range(len(smoothed)):
        if smoothed[y] > t_val and not in_block:
            in_block = True
            start_y = y
        elif smoothed[y] <= t_val and in_block:
            in_block = False
            end_y = y
            if end_y - start_y > 10:
                blocks.append((start_y, end_y))
    if in_block and (len(smoothed) - 1) - start_y > 10:
        blocks.append((start_y, len(smoothed) - 1))
    return blocks

for k in [2, 3, 5, 8]:
    for t in [5.0, 15.0, 25.0, 40.0]:
        blocks = find_blocks(k, t)
        if blocks:
            tallest = max(blocks, key=lambda b: b[1]-b[0])
            print(f"K={k}, T={t} -> Blocks: {len(blocks)}, Tallest: {tallest}, Height: {tallest[1]-tallest[0]}")
