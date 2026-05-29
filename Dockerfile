# Use Node 18 Bullseye which is Debian-based and easy for installing APT packages
FROM node:18-bullseye

# Install Python 3, OpenCV dependencies, and Tesseract OCR engine
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set directory
WORKDIR /app

# Install Python ML specific dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy all project structures
COPY . .

# Build Frontend statically
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Start Backend Server mapping the generated Frontend
WORKDIR /app/backend
RUN npm install

# Expose standard production port
EXPOSE 3000

# Start deployment natively
CMD ["npm", "start"]
