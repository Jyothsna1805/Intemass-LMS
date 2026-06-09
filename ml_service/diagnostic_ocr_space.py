import requests
import base64
import json
import sys
import os

def ocr_space_api(image_path, api_key='helloworld', engine='2'):
    """
    OCR.space API call for handwriting recognition using Engine 2.
    Free tier: api_key can be 'helloworld' for limited testing.
    For production, get a real API key from https://ocr.space/OCRAPI
    """
    url = 'https://api.ocr.space/parse/image'

    # Read image and encode to base64
    with open(image_path, 'rb') as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')

    payload = {
        'apikey': api_key,
        'base64Image': f'data:image/png;base64,{image_data}',
        'language': 'eng',
        'OCREngine': engine,  # Engine 2 for handwriting
        'isCreateSearchablePdf': 'false',
        'isSearchablePdfHideTextLayer': 'true'
    }

    try:
        response = requests.post(url, data=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}

def main():
    if len(sys.argv) < 2:
        print("Usage: python diagnostic_ocr_space.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(f"Image file not found: {image_path}")
        sys.exit(1)

    print(f"Testing OCR.space Engine 2 on: {image_path}")
    print("=" * 50)

    result = ocr_space_api(image_path)

    print("API Response JSON:")
    print(json.dumps(result, indent=2))

    print("\n" + "=" * 50)

    if 'ParsedResults' in result and result['ParsedResults']:
        text = result['ParsedResults'][0].get('ParsedText', '')
        print("Extracted Text:")
        print(text)
        print("\nAnalysis:")
        print(f"- Text length: {len(text)} characters")
        print(f"- Lines: {len(text.splitlines())}")
        if text.strip():
            print("- Status: SUCCESS - Text extracted")
        else:
            print("- Status: WARNING - No text extracted")
    else:
        error = result.get('ErrorMessage', result.get('error', 'Unknown error'))
        print(f"Error: {error}")
        print("- Status: FAILED - API call unsuccessful")

if __name__ == "__main__":
    main()