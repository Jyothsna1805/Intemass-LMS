import os

code = open('extracted_colab_code.py','r',encoding='utf-8').read()
start_idx = code.find('class AdvancedGradingEngine')
end_idx = code.find('# INTERACTIVE UI FOR GOOGLE COLAB')
core_code = code[start_idx:end_idx]

app_code = f"""import os
from flask import Flask, request, jsonify
import spacy
from sentence_transformers import SentenceTransformer, util
from textblob import TextBlob
import numpy as np
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
import io
from datetime import datetime

{core_code}

app = Flask(__name__)
grading_system = None

@app.before_request
def load_model():
    global grading_system
    if grading_system is None:
        grading_system = AdvancedGradingSystem()

@app.route("/grade", methods=["POST"])
def grade():
    data = request.json
    student_answer = data.get("student_answer", "")
    model_answer = data.get("model_answer", "")
    max_marks = data.get("max_marks", 10)
    try:
        if grading_system is None:
            return jsonify({{"success": False, "error": "Model not loaded"}})
        result = grading_system.grade_answer(student_answer, model_answer, max_marks)
        return jsonify({{"success": True, "data": result}})
    except Exception as exc:
        return jsonify({{"success": False, "error": str(exc)}})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
"""

with open('ml_service/app.py', 'w', encoding='utf-8') as f:
    f.write(app_code)

print("Created ml_service/app.py successfully!")
