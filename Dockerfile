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
# Install CPU-only PyTorch first to prevent Railway out-of-memory errors (2.5GB -> 200MB)
RUN pip3 install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip3 install --no-cache-dir -r requirements.txt

# Download AI Models during build to save time on boot
RUN python3 -m spacy download en_core_web_sm
RUN python3 -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger'); nltk.download('averaged_perceptron_tagger_eng'); nltk.download('wordnet'); nltk.download('stopwords'); nltk.download('brown'); nltk.download('omw-1.4')"

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

# Start deployment natively (Run Python AI Server in background, then Node server)
CMD ["sh", "-c", "python3 /app/ml_service/app.py & npm start"]
