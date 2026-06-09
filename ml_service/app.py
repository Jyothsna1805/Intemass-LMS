import os
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

class AdvancedGradingEngine:
    """
    Advanced grading using multiple NLP techniques:
    1. Sentence-BERT for semantic similarity
    2. SpaCy for linguistic analysis
    3. Named Entity Recognition
    4. Dependency parsing
    5. TextBlob for sentiment and readability
    """

    def __init__(self):
        print("🔄 Loading AI models (this may take a minute)...")

        # Load Sentence Transformer (best for semantic similarity)
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Load SpaCy for linguistic analysis
        self.nlp = spacy.load('en_core_web_sm')

        # Thresholds
        self.semantic_threshold = 0.65  # Semantic similarity threshold
        self.keyword_threshold = 0.60
        self.partial_threshold = 0.45

        print("✓ AI models loaded successfully!")

    def extract_key_concepts(self, text):
        """Extract key concepts using NER and noun chunks"""
        doc = self.nlp(text)

        concepts = {
            'entities': [(ent.text, ent.label_) for ent in doc.ents],
            'noun_chunks': [chunk.text for chunk in doc.noun_chunks],
            'keywords': [token.text for token in doc if token.pos_ in ['NOUN', 'PROPN', 'VERB'] and not token.is_stop],
            'key_phrases': []
        }

        # Extract important verb-noun pairs
        for token in doc:
            if token.pos_ == 'VERB':
                children = [child for child in token.children if child.pos_ in ['NOUN', 'PROPN']]
                for child in children:
                    concepts['key_phrases'].append(f"{token.text} {child.text}")

        return concepts

    def calculate_semantic_similarity(self, text1, text2):
        """Calculate semantic similarity using Sentence-BERT"""
        embeddings1 = self.sentence_model.encode(text1, convert_to_tensor=True)
        embeddings2 = self.sentence_model.encode(text2, convert_to_tensor=True)

        similarity = util.pytorch_cos_sim(embeddings1, embeddings2)
        return similarity.item()

    def analyze_answer_quality(self, text):
        """Analyze answer quality metrics"""
        doc = self.nlp(text)
        blob = TextBlob(text)

        metrics = {
            'word_count': len([token for token in doc if not token.is_punct]),
            'sentence_count': len(list(doc.sents)),
            'avg_sentence_length': len([token for token in doc if not token.is_punct]) / max(len(list(doc.sents)), 1),
            'unique_words': len(set([token.text.lower() for token in doc if not token.is_stop and not token.is_punct])),
            'lexical_diversity': len(set([token.text.lower() for token in doc])) / max(len([token for token in doc]), 1),
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity,
            'contains_examples': any(word in text.lower() for word in ['example', 'for instance', 'such as', 'like', 'e.g.', 'for example']),
        }

        return metrics

    def check_keyword_coverage(self, student_text, keywords):
        """Check how many keywords are covered"""
        if not keywords:
            return 1.0, []

        student_lower = student_text.lower()
        student_doc = self.nlp(student_lower)
        student_lemmas = set([token.lemma_ for token in student_doc])

        matched = []
        for keyword in keywords:
            keyword_doc = self.nlp(keyword.lower())
            keyword_lemmas = set([token.lemma_ for token in keyword_doc])

            # Check for direct match or lemma match
            if keyword.lower() in student_lower or keyword_lemmas.intersection(student_lemmas):
                matched.append(keyword)

        coverage = len(matched) / len(keywords)
        return coverage, matched

    def grade_point(self, student_answer, model_point, keywords):
        """Grade a single point using advanced NLP"""
        # Calculate semantic similarity
        semantic_score = self.calculate_semantic_similarity(student_answer, model_point)

        # Check keyword coverage
        keyword_coverage, matched_keywords = self.check_keyword_coverage(student_answer, keywords)

        # Extract concepts
        student_concepts = self.extract_key_concepts(student_answer)
        model_concepts = self.extract_key_concepts(model_point)

        # Calculate concept overlap
        student_key_words = set([w.lower() for w in student_concepts['keywords']])
        model_key_words = set([w.lower() for w in model_concepts['keywords']])

        concept_overlap = len(student_key_words.intersection(model_key_words)) / max(len(model_key_words), 1)

        # Combined score with weights
        combined_score = (
            semantic_score * 0.5 +           # Semantic similarity (50%)
            keyword_coverage * 0.3 +          # Keyword coverage (30%)
            concept_overlap * 0.2             # Concept overlap (20%)
        )

        # Determine status
        if combined_score >= self.semantic_threshold and keyword_coverage >= self.keyword_threshold:
            status = 'correct'
        elif combined_score >= self.partial_threshold:
            status = 'partial'
        else:
            status = 'incorrect'

        return {
            'status': status,
            'semantic_score': semantic_score,
            'keyword_coverage': keyword_coverage,
            'matched_keywords': matched_keywords,
            'concept_overlap': concept_overlap,
            'combined_score': combined_score,
            'student_concepts': student_concepts,
            'model_concepts': model_concepts
        }


# ===================================
# ENHANCED FEEDBACK GENERATOR
# ===================================

class EnhancedFeedbackGenerator:
    """Generate detailed human-like feedback based on advanced analysis"""

    def __init__(self):
        self.teacher_names = [
            "Dr. Sarah Mitchell", "Prof. James Anderson", "Dr. Emily Chen",
            "Prof. Michael Roberts", "Dr. Lisa Thompson", "Dr. David Kumar"
        ]

    def generate_point_feedback(self, grading_result, model_point, student_answer):
        """Generate detailed feedback for a point"""
        status = grading_result['status']
        semantic_score = grading_result['semantic_score']
        keyword_coverage = grading_result['keyword_coverage']
        matched_keywords = grading_result['matched_keywords']

        feedback = {'explanation': '', 'suggestion': '', 'details': ''}

        if status == 'correct':
            feedback['explanation'] = (
                f"Excellent work! Your answer demonstrates a strong understanding of this concept. "
                f"You achieved a {semantic_score*100:.1f}% semantic match with the model answer, "
                f"and successfully incorporated {len(matched_keywords)} key terms. "
                f"Your explanation is clear and well-articulated."
            )

            if semantic_score > 0.85:
                feedback['details'] = "Your answer shows exceptional comprehension. You've captured the essence of the concept perfectly."
            else:
                feedback['details'] = "While your answer is correct, there's always room to add more depth with specific examples."

        elif status == 'incorrect':
            missing_concepts = set(grading_result['model_concepts']['keywords']) - set(grading_result['student_concepts']['keywords'])

            feedback['explanation'] = (
                f"I notice this part of your answer needs significant improvement. "
                f"Your response only achieved a {semantic_score*100:.1f}% similarity with the expected answer, "
                f"which indicates you may have misunderstood the key concept. "
            )

            if keyword_coverage < 0.3:
                feedback['explanation'] += (
                    f"Additionally, you missed important keywords that are crucial to this topic. "
                )

            feedback['suggestion'] = (
                f"I strongly recommend reviewing the following concepts: "
                f"{', '.join(list(missing_concepts)[:5])}. "
                f"Try to understand not just WHAT these terms mean, but HOW they relate to each other. "
                f"Practice explaining this concept in your own words, and include specific examples."
            )

            feedback['details'] = "This is a fundamental concept that you need to master before moving forward."

        else:  # partial
            feedback['explanation'] = (
                f"You're on the right track, but your answer needs more development. "
                f"You achieved a {semantic_score*100:.1f}% match with the model answer, "
                f"which shows partial understanding. "
            )

            if keyword_coverage >= 0.6:
                feedback['explanation'] += (
                    f"You've successfully used {len(matched_keywords)} key terms, which is good! "
                    f"However, your explanation lacks the depth and clarity needed for full marks."
                )
            else:
                feedback['explanation'] += (
                    f"You only incorporated {len(matched_keywords)} important keywords, "
                    f"which weakens your answer."
                )

            feedback['suggestion'] = (
                f"To improve: (1) Expand on your main points with more detailed explanations, "
                f"(2) Include specific examples to illustrate your understanding, "
                f"(3) Make sure to address all aspects of the question. "
                f"Try restructuring your answer to flow more logically from one point to the next."
            )

            feedback['details'] = "Consider adding concrete examples to strengthen your explanation."

        return feedback

    def generate_overall_feedback(self, score, max_score, points_analysis, quality_metrics):
        """Generate comprehensive overall feedback"""
        percentage = (score / max_score) * 100

        # Opening based on performance
        if percentage >= 90:
            opening = "Outstanding performance! You've demonstrated exceptional mastery of this material."
        elif percentage >= 75:
            opening = "Great work! You've shown a strong understanding of the core concepts."
        elif percentage >= 60:
            opening = "Good effort! You're showing progress, though there's room for improvement."
        elif percentage >= 40:
            opening = "Your answer shows some understanding, but significant gaps remain."
        else:
            opening = "I'm concerned about your grasp of this material and encourage you to seek additional help."

        # Analyze answer quality
        quality_comments = []

        if quality_metrics['word_count'] < 50:
            quality_comments.append("Your answer is quite brief. Try to provide more detailed explanations.")
        elif quality_metrics['word_count'] > 300:
            quality_comments.append("Your answer is comprehensive, showing thorough engagement with the material.")

        if quality_metrics['lexical_diversity'] < 0.5:
            quality_comments.append("Try to use more varied vocabulary to express your ideas.")
        elif quality_metrics['lexical_diversity'] > 0.7:
            quality_comments.append("Excellent vocabulary usage and writing style.")

        if quality_metrics['contains_examples']:
            quality_comments.append("Good job including examples to support your explanations!")
        else:
            quality_comments.append("Consider adding specific examples to make your points more concrete.")

        # Point-by-point analysis
        correct_count = sum(1 for p in points_analysis if p['status'] == 'correct')
        partial_count = sum(1 for p in points_analysis if p['status'] == 'partial')
        incorrect_count = sum(1 for p in points_analysis if p['status'] == 'incorrect')

        analysis = []
        if correct_count > 0:
            analysis.append(f"You successfully answered {correct_count} point{'s' if correct_count > 1 else ''} correctly")
        if partial_count > 0:
            analysis.append(f"{partial_count} point{'s' if partial_count > 1 else ''} showed partial understanding")
        if incorrect_count > 0:
            analysis.append(f"{incorrect_count} point{'s' if incorrect_count > 1 else ''} need{'s' if incorrect_count == 1 else ''} significant review")

        # Build complete feedback
        feedback = f"{opening} "

        if analysis:
            feedback += f"Breaking it down: {', and '.join(analysis)}. "

        if quality_comments:
            feedback += "Regarding your writing: " + " ".join(quality_comments) + " "

        # Recommendations
        if percentage < 75:
            feedback += (
                "Moving forward, I recommend: "
                "(1) Review the course materials thoroughly, "
                "(2) Practice explaining concepts in your own words, "
                "(3) Engage with practice questions regularly, "
                "(4) Don't hesitate to ask questions during class or office hours. "
            )

        # Encouragement
        if percentage >= 75:
            feedback += "Keep up the excellent work and maintain this level of understanding!"
        elif percentage >= 50:
            feedback += "With focused study, you can definitely improve your performance!"
        else:
            feedback += "Please schedule time to meet with me during office hours so we can address these gaps together."

        return feedback

    def generate_strengths_and_improvements(self, points_analysis, quality_metrics):
        """Generate specific strengths and areas for improvement"""
        strengths = []
        improvements = []

        # Analyze strengths
        correct_count = sum(1 for p in points_analysis if p['status'] == 'correct')
        if correct_count > 0:
            strengths.append(f"Demonstrated solid understanding in {correct_count} area{'s' if correct_count > 1 else ''}")

        avg_semantic = np.mean([p['semantic_score'] for p in points_analysis])
        if avg_semantic > 0.7:
            strengths.append("Strong semantic understanding of concepts")

        avg_keyword = np.mean([p['keyword_coverage'] for p in points_analysis])
        if avg_keyword > 0.7:
            strengths.append("Good use of technical terminology")

        if quality_metrics['contains_examples']:
            strengths.append("Effective use of examples to support arguments")

        if quality_metrics['lexical_diversity'] > 0.65:
            strengths.append("Varied and sophisticated vocabulary")

        if quality_metrics['word_count'] > 100:
            strengths.append("Provided detailed and thorough explanations")

        # Analyze improvements
        incorrect_count = sum(1 for p in points_analysis if p['status'] == 'incorrect')
        if incorrect_count > 0:
            improvements.append(f"Review and master {incorrect_count} missed concept{'s' if incorrect_count > 1 else ''}")

        partial_count = sum(1 for p in points_analysis if p['status'] == 'partial')
        if partial_count > 0:
            improvements.append("Develop more comprehensive explanations for partially correct answers")

        if avg_keyword < 0.6:
            improvements.append("Incorporate more key terminology from the course material")

        if not quality_metrics['contains_examples']:
            improvements.append("Include specific examples to illustrate concepts")

        if quality_metrics['word_count'] < 75:
            improvements.append("Provide more detailed and elaborate explanations")

        if quality_metrics['avg_sentence_length'] < 8:
            improvements.append("Develop more complex sentence structures for clearer explanations")

        # Ensure we have at least some items
        if not strengths:
            strengths.append("Attempted to address the question")

        if not improvements:
            improvements.append("Continue refining your understanding of the material")

        return strengths[:5], improvements[:6]


# ===================================
# PDF GENERATOR
# ===================================

class PDFReportGenerator:
    """Generate professional PDF reports"""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()

    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))

        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=12,
            spaceBefore=12
        ))

        self.styles.add(ParagraphStyle(
            name='Feedback',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY
        ))

    def generate_report(self, grading_result):
        """Generate PDF report"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                              rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)

        elements = []

        # Title
        elements.append(Paragraph("🤖 Advanced AI Grading Report", self.styles['CustomTitle']))
        elements.append(Spacer(1, 0.2*inch))

        # Student Info
        info_data = [
            ['Student:', grading_result['student_name'], 'Email:', grading_result['email']],
            ['Date:', grading_result['date'], 'Time:', grading_result['time']],
        ]

        info_table = Table(info_data, colWidths=[1.5*inch, 2*inch, 1*inch, 2*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.3*inch))

        # Score Box
        score_data = [[
            Paragraph(f"<para align=center><b><font size=36 color='#667eea'>{grading_result['score']}/{grading_result['max_score']}</font></b><br/>"
                     f"<font size=12>Performance: {(grading_result['score']/grading_result['max_score']*100):.1f}%</font><br/>"
                     f"<font size=10 color='#666'>AI Confidence: {grading_result.get('avg_confidence', 0)*100:.1f}%</font></para>",
                     self.styles['Normal'])
        ]]
        score_table = Table(score_data, colWidths=[6.5*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f4ff')),
            ('PADDING', (0, 0), (-1, -1), 20),
            ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#667eea')),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 0.3*inch))

        # Student Answer
        elements.append(Paragraph("✏️ Student Answer", self.styles['SectionHeader']))
        elements.append(Paragraph(grading_result['student_answer'].replace('\n', '<br/>'), self.styles['Feedback']))
        elements.append(Spacer(1, 0.3*inch))

        # Detailed Feedback
        elements.append(Paragraph("🤖 AI-Powered Analysis", self.styles['SectionHeader']))

        for point in grading_result['points_feedback']:
            color = colors.HexColor('#d4edda') if point['status'] == 'correct' else \
                   colors.HexColor('#fff3cd') if point['status'] == 'partial' else \
                   colors.HexColor('#f8d7da')

            icon = '✓' if point['status'] == 'correct' else '⚠' if point['status'] == 'partial' else '✗'

            metrics = f"Semantic: {point.get('semantic_score', 0)*100:.1f}% | Keywords: {point.get('keyword_coverage', 0)*100:.1f}%"

            point_data = [[
                Paragraph(f"<b>{icon} Point {point['id']}: {point['status'].title()}</b><br/>"
                         f"<font size=8 color='#666'>{metrics}</font><br/><br/>"
                         f"<i>Expected: {point['expected']}</i><br/><br/>"
                         f"<b>Analysis:</b> {point['explanation']}"
                         f"{('<br/><br/><b>💡 Recommendation:</b> ' + point['suggestion']) if point.get('suggestion') else ''}"
                         f"{('<br/><br/><b>📊 Details:</b> ' + point.get('details', '')) if point.get('details') else ''}",
                         self.styles['Feedback'])
            ]]

            point_table = Table(point_data, colWidths=[6.5*inch])
            point_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), color),
                ('PADDING', (0, 0), (-1, -1), 12),
                ('BOX', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(point_table)
            elements.append(Spacer(1, 0.15*inch))

        # Overall Feedback
        elements.append(PageBreak())
        elements.append(Paragraph("👨‍🏫 Comprehensive Assessment", self.styles['SectionHeader']))
        elements.append(Paragraph(f"<i>by {grading_result['teacher_name']}</i>", self.styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(grading_result['overall_feedback'], self.styles['Feedback']))
        elements.append(Spacer(1, 0.2*inch))

        # Strengths and Improvements
        strengths_data = [[Paragraph("<b>✅ Strengths</b>", self.styles['Normal'])]]
        for strength in grading_result['strengths']:
            strengths_data.append([Paragraph(f"• {strength}", self.styles['Feedback'])])

        improvements_data = [[Paragraph("<b>📈 Growth Areas</b>", self.styles['Normal'])]]
        for improvement in grading_result['improvements']:
            improvements_data.append([Paragraph(f"• {improvement}", self.styles['Feedback'])])

        combined_data = [[
            Table(strengths_data, colWidths=[3*inch]),
            Table(improvements_data, colWidths=[3*inch])
        ]]

        combined_table = Table(combined_data, colWidths=[3.25*inch, 3.25*inch])
        elements.append(combined_table)

        # Footer
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(
            f"<para align=center><font size=8 color='grey'>"
            f"Generated by Advanced AI Grading System (Sentence-BERT + SpaCy) | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
            f"This AI-assisted assessment uses semantic similarity for accurate evaluation."
            f"</font></para>",
            self.styles['Normal']
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer


# ===================================
# MAIN GRADING SYSTEM
# ===================================

class AdvancedGradingSystem:
    """Main grading system orchestrator"""

    def __init__(self):
        self.engine = AdvancedGradingEngine()
        self.feedback_gen = EnhancedFeedbackGenerator()

    def parse_model_answer(self, text):
        """Parse model answer into points"""
        points = []
        segments = text.split('[ENDPOINT]')

        for i, segment in enumerate(segments, 1):
            segment = segment.strip()
            if not segment:
                continue

            # Extract point number
            match = re.search(r'^\s*(\d+)\s*\.', segment)
            if match:
                point_num = match.group(1)
                point_text = segment[match.end():].strip()
            else:
                point_num = str(i)
                point_text = segment

            # Extract keywords (text in triple parentheses)
            keywords = re.findall(r'\(\(\((.*?)\)\)\)', point_text)
            clean_text = re.sub(r'\(\(\((.*?)\)\)\)', r'\1', point_text)

            points.append({
                'id': i,
                'number': point_num,
                'text': clean_text,
                'keywords': keywords
            })

        return points

    def grade_answer(self, student_answer, model_answer, max_marks):
        """Grade student answer against model answer"""
        # Parse model answer
        model_points = self.parse_model_answer(model_answer)

        if not model_points:
            return None

        # Analyze student answer quality
        quality_metrics = self.engine.analyze_answer_quality(student_answer)

        # Grade each point
        points_analysis = []
        total_score = 0

        for point in model_points:
            # Grade this point
            grading_result = self.engine.grade_point(
                student_answer,
                point['text'],
                point['keywords']
            )

            # Generate feedback
            feedback = self.feedback_gen.generate_point_feedback(
                grading_result,
                point['text'],
                student_answer
            )

            # Combine results
            point_result = {
                'id': point['id'],
                'status': grading_result['status'],
                'expected': point['text'],
                'semantic_score': grading_result['semantic_score'],
                'keyword_coverage': grading_result['keyword_coverage'],
                'matched_keywords': grading_result['matched_keywords'],
                'explanation': feedback['explanation'],
                'suggestion': feedback['suggestion'],
                'details': feedback['details']
            }

            points_analysis.append(point_result)

            # Calculate score
            if grading_result['status'] == 'correct':
                total_score += 1
            elif grading_result['status'] == 'partial':
                total_score += 0.0  # Manager requested zero marks for partial answers!

        # Calculate final score
        final_score = int((total_score / len(model_points)) * max_marks)

        # Generate overall feedback
        overall_feedback = self.feedback_gen.generate_overall_feedback(
            final_score,
            max_marks,
            points_analysis,
            quality_metrics
        )

        # Generate strengths and improvements
        strengths, improvements = self.feedback_gen.generate_strengths_and_improvements(
            points_analysis,
            quality_metrics
        )

        # Calculate average confidence
        avg_confidence = np.mean([p['semantic_score'] for p in points_analysis])

        return {
            'score': final_score,
            'max_score': max_marks,
            'points_feedback': points_analysis,
            'overall_feedback': overall_feedback,
            'strengths': strengths,
            'improvements': improvements,
            'avg_confidence': avg_confidence,
            'quality_metrics': quality_metrics
        }

# ===================================


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
            return jsonify({"success": False, "error": "Model not loaded"})
        result = grading_system.grade_answer(student_answer, model_answer, max_marks)
        return jsonify({"success": True, "data": result})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
