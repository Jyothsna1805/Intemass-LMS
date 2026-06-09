# ===================================
# ADVANCED AUTOMATED ANSWER GRADING SYSTEM
# Using Sentence Transformers, BERT, and Semantic Similarity
# ===================================

# Install required packages
!pip install -q sentence-transformers transformers torch scikit-learn nltk spacy textblob reportlab ipywidgets
!python -m spacy download en_core_web_sm

# Download NLTK data (including punkt_tab fix)
import nltk
print("Downloading NLTK data...")
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
nltk.download('averaged_perceptron_tagger_eng')
nltk.download('wordnet')
nltk.download('stopwords')
nltk.download('brown')
nltk.download('omw-1.4')

# Import libraries
import re
import math
import logging
from datetime import datetime
from IPython.display import display, HTML, clear_output
import ipywidgets as widgets
from ipywidgets import Layout, Button, VBox, HBox, Text, Textarea
import io
import warnings
warnings.filterwarnings('ignore')

# Advanced NLP libraries
import torch
from sentence_transformers import SentenceTransformer, util
import spacy
from textblob import TextBlob
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

print("✓ All packages installed successfully!")

# ===================================
# ADVANCED NLP GRADING ENGINE
# ===================================

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
                total_score += 0.5

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
# INTERACTIVE UI FOR GOOGLE COLAB
# Connect this after loading the grading system classes
# ===================================

def create_advanced_grading_ui():
    """Create interactive UI for grading system"""

    # Import required libraries
    from IPython.display import display, HTML, clear_output
    import ipywidgets as widgets
    from ipywidgets import Layout, Button, VBox, HBox, Text, Textarea, HTML as HTMLWidget
    from datetime import datetime
    import random

    # Initialize grading system
    print("🔄 Initializing Advanced Grading System...")
    grading_system = AdvancedGradingSystem()
    pdf_generator = PDFReportGenerator()
    print("✓ System ready!")

    # Sample data
    sample_question = "(a) Explain the role of prices in a free market economy. [10]"

    sample_model_answer = """1. In a free market economy, resources are allocated through the price mechanism where demand and supply will interact to allocate resources among competitive and alternative uses. [ENDPOINT]

2. We shall first explain the signalling and incentive role of prices in a good market, say the market for strawberries. We shall begin our analysis by assuming that the market for strawberries is in equilibrium at price, P1 and output, Q1, shown in figure 1. Suppose now consumers decide to eat more strawberries because of their health benefits. This will cause demand for strawberries to increase from D1 to D2. At the initial price, P1 there is a shortage of Q1Q3. This will cause price to rise until the shortage is eliminated. [ENDPOINT]

3. The increase in price will cause consumers and producers to act in their own self-interest. The increase in price signals to producers that consumers wish to buy strawberries. [ENDPOINT]

4. The higher price of strawberries, which increases the profits of the firms would provide an incentive for them to increase the production of strawberries. [ENDPOINT]

5. In figure 1 below, the quantity supplied increases from Q1 to Q2. At the same time, the higher price also serves as a signal and incentive for consumers. [ENDPOINT]

6. It signals that strawberries are expensive now and provides an incentive for consumers to cut back on their consumption of strawberries and look for cheaper substitutes. This will cause the quantity demanded of strawberries to decrease from Q3 to Q2. In short, the increase in price of strawberries from P1 to P2 (due to increase in demand) has resulted in more resources being allocated to the strawberries production. The quantity exchanged/traded has increased from Q1 to Q2. [ENDPOINT]

7. The same reasoning applies to factor markets. Referring to the strawberry market, the increase in demand for strawberries would lead to an increase in demand for strawberry workers. This would lead to an increase in wages of strawberry workers, thus increasing in the quantity of strawberry workers supplied. The higher wage is both a signal and an incentive to the labor force to move into the strawberry industry. Prices therefore serve as signals to factors of production to indicate where they are most needed, and act as an incentive to encourage them to move into growing industries, and to leave declining ones. [ENDPOINT]

8. Price also serves to ration scarce goods and services among the consumers who are demanding them. When there is an increase in demand, there will be an excess demand at the existing price. This will cause price to rise until the quantity demanded is just equal to the quantity supplied. [ENDPOINT]

9. Those who are unable to pay the higher prices will be eliminated from the market. Hence, price rations scarce goods to those who can afford to pay the price. [ENDPOINT]

10. On the other hand, when there is an increase in supply, the excess supply will cause prices to fall until the quantity demanded equals the quantity supplied. Thus, at a lower market equilibrium price more people can now afford to buy the good. [ENDPOINT]"""

    # Custom CSS
    style = """
    <style>
    .header-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 25px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .header-box h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 700;
    }
    .header-box p {
        margin: 10px 0 0 0;
        font-size: 16px;
        opacity: 0.95;
    }
    .step-indicator {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 5px solid #667eea;
    }
    .result-card {
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 25px;
        margin: 15px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .score-display {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        margin: 25px 0;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .score-display .score {
        font-size: 72px;
        font-weight: 700;
        margin: 10px 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .score-display .percentage {
        font-size: 24px;
        margin-top: 10px;
    }
    .point-correct {
        background: linear-gradient(to right, #d4edda, #c3e6cb);
        border-left: 5px solid #28a745;
        padding: 20px;
        margin: 15px 0;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(40, 167, 69, 0.15);
    }
    .point-partial {
        background: linear-gradient(to right, #fff3cd, #ffeeba);
        border-left: 5px solid #ffc107;
        padding: 20px;
        margin: 15px 0;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(255, 193, 7, 0.15);
    }
    .point-incorrect {
        background: linear-gradient(to right, #f8d7da, #f5c6cb);
        border-left: 5px solid #dc3545;
        padding: 20px;
        margin: 15px 0;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(220, 53, 69, 0.15);
    }
    .metric-badge {
        display: inline-block;
        background: rgba(255,255,255,0.9);
        padding: 8px 15px;
        border-radius: 20px;
        margin: 5px;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .feedback-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 15px 0;
        border: 1px solid #dee2e6;
    }
    .strength-item {
        background: #d4edda;
        padding: 12px 18px;
        margin: 8px 0;
        border-radius: 8px;
        border-left: 4px solid #28a745;
    }
    .improvement-item {
        background: #fff3cd;
        padding: 12px 18px;
        margin: 8px 0;
        border-radius: 8px;
        border-left: 4px solid #ffc107;
    }
    .info-box {
        background: #e7f3ff;
        border-left: 4px solid #2196F3;
        padding: 15px;
        margin: 15px 0;
        border-radius: 5px;
    }
    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 12px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    .section-header {
        color: #667eea;
        font-size: 24px;
        font-weight: 700;
        margin: 25px 0 15px 0;
        padding-bottom: 10px;
        border-bottom: 3px solid #667eea;
    }
    </style>
    """

    display(HTML(style))

    # Header
    header = HTMLWidget(value="""
    <div class="header-box">
        <h1>🤖 Advanced AI Answer Grading System</h1>
        <p>Powered by Sentence-BERT, SpaCy & Advanced NLP | Semantic Similarity Analysis</p>
    </div>
    """)

    # Step 1: Student Information
    step1_html = HTMLWidget(value="""
    <div class="step-indicator">
        <h2 style="color: #667eea; margin: 0;">📝 Step 1: Student Information</h2>
        <p style="margin: 10px 0 0 0; color: #6c757d;">Please enter the student details below</p>
    </div>
    """)

    student_name = Text(
        placeholder='Enter student name (e.g., John Smith)',
        description='Student Name:',
        style={'description_width': 'initial'},
        layout=Layout(width='70%', height='40px')
    )

    student_email = Text(
        placeholder='Enter email (e.g., john.smith@university.edu)',
        description='Email Address:',
        style={'description_width': 'initial'},
        layout=Layout(width='70%', height='40px')
    )

    # Step 2: Question Setup
    step2_html = HTMLWidget(value="""
    <div class="step-indicator">
        <h2 style="color: #667eea; margin: 0;">📚 Step 2: Question & Model Answer Setup</h2>
        <p style="margin: 10px 0 0 0; color: #6c757d;">Upload your question and the marking scheme</p>
    </div>
    <div class="info-box">
        <strong>ℹ️ Model Answer Format:</strong><br>
        • Separate each marking point with <code>[ENDPOINT]</code><br>
        • Use triple parentheses <code>(((keyword)))</code> to mark important terms<br>
        • Example: "The price mechanism ((allocates)) resources. [ENDPOINT]"
    </div>
    """)

    question_text = Textarea(
        value=sample_question,
        description='Question:',
        placeholder='Enter the exam question here...',
        style={'description_width': 'initial'},
        layout=Layout(width='95%', height='100px')
    )

    max_marks = widgets.IntText(
        value=10,
        description='Max Marks:',
        style={'description_width': 'initial'},
        layout=Layout(width='30%')
    )

    model_answer = Textarea(
        value=sample_model_answer,
        description='Model Answer:',
        placeholder='Enter the marking scheme with [ENDPOINT] separators...',
        style={'description_width': 'initial'},
        layout=Layout(width='95%', height='300px')
    )

    load_sample_btn = Button(
        description='📋 Load Sample Economics Question',
        button_style='info',
        layout=Layout(width='300px', height='40px')
    )

    # Step 3: Student Answer
    step3_html = HTMLWidget(value="""
    <div class="step-indicator">
        <h2 style="color: #667eea; margin: 0;">✍️ Step 3: Student Answer</h2>
        <p style="margin: 10px 0 0 0; color: #6c757d;">Enter the student's response to be graded</p>
    </div>
    """)

    student_answer = Textarea(
        placeholder='Paste the student answer here...',
        description='Student Answer:',
        style={'description_width': 'initial'},
        layout=Layout(width='95%', height='300px')
    )

    # Action buttons
    grade_btn = Button(
        description='🚀 Grade Answer with AI',
        button_style='success',
        layout=Layout(width='250px', height='50px'),
        style={'button_color': '#28a745', 'font_weight': 'bold'}
    )

    download_pdf_btn = Button(
        description='📥 Download PDF Report',
        button_style='primary',
        layout=Layout(width='250px', height='50px'),
        disabled=True
    )

    reset_btn = Button(
        description='🔄 Reset Form',
        button_style='warning',
        layout=Layout(width='200px', height='50px')
    )

    # Output area
    output_area = widgets.Output(layout=Layout(width='100%'))

    # State management
    current_result = {'data': None}

    def load_sample(b):
        """Load sample question"""
        question_text.value = sample_question
        model_answer.value = sample_model_answer
        max_marks.value = 10

        with output_area:
            clear_output()
            display(HTML("""
            <div class="info-box">
                ✅ <strong>Sample question loaded!</strong> This is an Economics question about free market prices.
                You can now enter a student answer and click "Grade Answer with AI".
            </div>
            """))

    def grade_answer(b):
        """Grade the student answer"""
        with output_area:
            clear_output()

            # Validation
            if not student_name.value.strip():
                display(HTML('<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Please enter student name</div>'))
                return

            if not student_answer.value.strip():
                display(HTML('<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Please enter student answer</div>'))
                return

            if not model_answer.value.strip():
                display(HTML('<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Please enter model answer</div>'))
                return

            # Show processing
            display(HTML("""
            <div class="info-box" style="background: #fff3cd; border-color: #ffc107;">
                <h3 style="margin: 0;">⏳ AI Grading in Progress...</h3>
                <p style="margin: 10px 0 0 0;">
                    🧠 Analyzing semantic similarity...<br>
                    📊 Extracting key concepts...<br>
                    🔍 Checking keyword coverage...<br>
                    ✨ Generating personalized feedback...
                </p>
            </div>
            """))

            try:
                # Perform grading
                result = grading_system.grade_answer(
                    student_answer.value,
                    model_answer.value,
                    max_marks.value
                )

                if result is None:
                    display(HTML('<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Error: Could not parse model answer. Check [ENDPOINT] markers.</div>'))
                    return

                # Store result
                current_result['data'] = {
                    'student_name': student_name.value,
                    'email': student_email.value,
                    'question': question_text.value,
                    'student_answer': student_answer.value,
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'time': datetime.now().strftime('%H:%M:%S'),
                    'teacher_name': random.choice(grading_system.feedback_gen.teacher_names),
                    **result
                }

                # Clear and show results
                clear_output()
                display_results(current_result['data'])

                # Enable PDF download
                download_pdf_btn.disabled = False

            except Exception as e:
                clear_output()
                display(HTML(f'<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Error during grading: {str(e)}</div>'))

    def display_results(result):
        """Display grading results"""
        percentage = (result['score'] / result['max_score']) * 100

        # Determine grade and emoji
        if percentage >= 90:
            grade_emoji = "🏆"
            grade_text = "Outstanding"
            grade_color = "#28a745"
        elif percentage >= 75:
            grade_emoji = "⭐"
            grade_text = "Excellent"
            grade_color = "#20c997"
        elif percentage >= 60:
            grade_emoji = "👍"
            grade_text = "Good"
            grade_color = "#17a2b8"
        elif percentage >= 40:
            grade_emoji = "📚"
            grade_text = "Fair"
            grade_color = "#ffc107"
        else:
            grade_emoji = "📖"
            grade_text = "Needs Improvement"
            grade_color = "#dc3545"

        # Score display
        score_html = f"""
        <div class="score-display">
            <div style="font-size: 48px;">{grade_emoji}</div>
            <div class="score">{result['score']}/{result['max_score']}</div>
            <div class="percentage">{percentage:.1f}% - {grade_text}</div>
            <div style="margin-top: 15px; opacity: 0.9;">
                <span class="metric-badge">AI Confidence: {result['avg_confidence']*100:.1f}%</span>
                <span class="metric-badge">Words: {result['quality_metrics']['word_count']}</span>
                <span class="metric-badge">Sentences: {result['quality_metrics']['sentence_count']}</span>
            </div>
        </div>
        """
        display(HTML(score_html))

        # Student info
        info_html = f"""
        <div class="result-card">
            <h3 style="color: #667eea; margin-top: 0;">👤 Student Information</h3>
            <p><strong>Name:</strong> {result['student_name']}</p>
            <p><strong>Email:</strong> {result['email']}</p>
            <p><strong>Date:</strong> {result['date']} at {result['time']}</p>
            <p><strong>Evaluated by:</strong> {result['teacher_name']}</p>
        </div>
        """
        display(HTML(info_html))

        # Point-by-point analysis
        display(HTML('<h2 class="section-header">📊 Detailed Point-by-Point Analysis</h2>'))

        for point in result['points_feedback']:
            status_icon = {
                'correct': '✅',
                'partial': '⚠️',
                'incorrect': '❌'
            }[point['status']]

            status_class = f"point-{point['status']}"

            point_html = f"""
            <div class="{status_class}">
                <h4 style="margin: 0 0 10px 0; color: #212529;">
                    {status_icon} Point {point['id']}: {point['status'].upper()}
                </h4>

                <div style="margin: 10px 0;">
                    <span class="metric-badge">Semantic: {point['semantic_score']*100:.1f}%</span>
                    <span class="metric-badge">Keywords: {point['keyword_coverage']*100:.1f}%</span>
                    <span class="metric-badge">Matched: {len(point['matched_keywords'])} terms</span>
                </div>

                <div style="background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>📝 Expected Answer:</strong><br>
                    <em>{point['expected']}</em>
                </div>

                <div style="margin: 15px 0;">
                    <strong>🔍 Analysis:</strong><br>
                    {point['explanation']}
                </div>

                {f'<div style="margin: 15px 0; background: rgba(255,255,255,0.7); padding: 12px; border-radius: 8px;"><strong>💡 Recommendation:</strong><br>{point["suggestion"]}</div>' if point['suggestion'] else ''}

                {f'<div style="margin: 15px 0;"><strong>📌 Additional Notes:</strong><br>{point["details"]}</div>' if point.get('details') else ''}
            </div>
            """
            display(HTML(point_html))

        # Overall feedback
        display(HTML('<h2 class="section-header">👨‍🏫 Comprehensive Teacher Feedback</h2>'))

        feedback_html = f"""
        <div class="result-card">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #667eea;">
                <p style="font-size: 16px; line-height: 1.8; margin: 0;">
                    {result['overall_feedback']}
                </p>
            </div>
        </div>
        """
        display(HTML(feedback_html))

        # Strengths and Improvements
        display(HTML('<h2 class="section-header">📈 Strengths & Growth Areas</h2>'))

        strengths_html = '<div class="result-card"><h3 style="color: #28a745;">✅ Key Strengths</h3>'
        for strength in result['strengths']:
            strengths_html += f'<div class="strength-item">• {strength}</div>'
        strengths_html += '</div>'

        improvements_html = '<div class="result-card"><h3 style="color: #ffc107;">📚 Areas for Improvement</h3>'
        for improvement in result['improvements']:
            improvements_html += f'<div class="improvement-item">• {improvement}</div>'
        improvements_html += '</div>'

        display(HTML(strengths_html))
        display(HTML(improvements_html))

        # Quality metrics
        display(HTML('<h2 class="section-header">📊 Writing Quality Analysis</h2>'))

        quality_html = f"""
        <div class="result-card">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">{result['quality_metrics']['word_count']}</div>
                    <div style="color: #6c757d;">Total Words</div>
                </div>
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">{result['quality_metrics']['sentence_count']}</div>
                    <div style="color: #6c757d;">Sentences</div>
                </div>
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">{result['quality_metrics']['lexical_diversity']:.2f}</div>
                    <div style="color: #6c757d;">Lexical Diversity</div>
                </div>
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">{'✓' if result['quality_metrics']['contains_examples'] else '✗'}</div>
                    <div style="color: #6c757d;">Contains Examples</div>
                </div>
            </div>
        </div>
        """
        display(HTML(quality_html))

    def download_pdf(b):
        """Generate and download PDF report"""
        if current_result['data'] is None:
            with output_area:
                display(HTML('<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Please grade an answer first</div>'))
            return

        try:
            # Generate PDF
            pdf_buffer = pdf_generator.generate_report(current_result['data'])

            # Save to file
            filename = f"grading_report_{current_result['data']['student_name'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

            with open(filename, 'wb') as f:
                f.write(pdf_buffer.read())

            with output_area:
                display(HTML(f"""
                <div class="info-box" style="background: #d4edda; border-color: #28a745;">
                    ✅ <strong>PDF Report Generated Successfully!</strong><br>
                    📄 File saved as: <code>{filename}</code><br>
                    💾 You can find it in your Colab files panel on the left.
                </div>
                """))

            from google.colab import files
            files.download(filename)

        except Exception as e:
            with output_area:
                display(HTML(f'<div class="info-box" style="background: #f8d7da; border-color: #dc3545;">❌ Error generating PDF: {str(e)}</div>'))

    def reset_form(b):
        """Reset the form"""
        student_name.value = ''
        student_email.value = ''
        student_answer.value = ''
        download_pdf_btn.disabled = True
        current_result['data'] = None

        with output_area:
            clear_output()
            display(HTML("""
            <div class="info-box">
                🔄 <strong>Form reset successfully!</strong> You can start a new grading session.
            </div>
            """))

    # Button handlers
    load_sample_btn.on_click(load_sample)
    grade_btn.on_click(grade_answer)
    download_pdf_btn.on_click(download_pdf)
    reset_btn.on_click(reset_form)

    # Layout
    display(header)

    display(step1_html)
    display(VBox([
        student_name,
        student_email
    ], layout=Layout(padding='0 0 20px 0')))

    display(step2_html)
    display(VBox([
        question_text,
        max_marks,
        model_answer,
        load_sample_btn
    ], layout=Layout(padding='0 0 20px 0')))

    display(step3_html)
    display(VBox([
        student_answer
    ], layout=Layout(padding='0 0 20px 0')))

    display(HBox([
        grade_btn,
        download_pdf_btn,
        reset_btn
    ], layout=Layout(padding='20px 0', justify_content='center')))

    display(output_area)

    # Initial message
    with output_area:
        display(HTML("""
        <div class="info-box">
            <h3 style="margin: 0 0 10px 0;">👋 Welcome to the Advanced AI Grading System!</h3>
            <p style="margin: 0;">
                <strong>Quick Start:</strong><br>
                1️⃣ Fill in student information<br>
                2️⃣ Click "Load Sample Economics Question" to see an example<br>
                3️⃣ Enter or paste a student answer<br>
                4️⃣ Click "Grade Answer with AI" to get instant detailed feedback<br>
                5️⃣ Download the comprehensive PDF report
            </p>
        </div>
        """))

# ===================================
# RUN THE UI
# ===================================

# Call this function after loading all the grading system classes
create_advanced_grading_ui()

# ===================================
# ADVANCED AUTOMATED ANSWER GRADING SYSTEM
# Modified for Human-like, Specific Feedback
# ===================================

# Install required packages
!pip install -q sentence-transformers transformers torch scikit-learn nltk spacy textblob reportlab ipywidgets
!python -m spacy download en_core_web_sm

# Download NLTK data
import nltk
print("Downloading NLTK data...")
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
nltk.download('averaged_perceptron_tagger_eng')
nltk.download('wordnet')
nltk.download('stopwords')
nltk.download('brown')
nltk.download('omw-1.4')

# Import libraries
import re
import math
import logging
from datetime import datetime
from IPython.display import display, HTML, clear_output
import ipywidgets as widgets
from ipywidgets import Layout, Button, VBox, HBox, Text, Textarea
import io
import warnings
warnings.filterwarnings('ignore')

# Advanced NLP libraries
import torch
from sentence_transformers import SentenceTransformer, util
import spacy
from textblob import TextBlob
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

print("✓ All packages installed successfully!")

# ===================================
# ADVANCED NLP GRADING ENGINE
# ===================================

class AdvancedGradingEngine:
    """
    Advanced grading using multiple NLP techniques
    """

    def __init__(self):
        print("🔄 Loading AI models (this may take a minute)...")

        # Load Sentence Transformer
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Load SpaCy for linguistic analysis
        self.nlp = spacy.load('en_core_web_sm')

        # Thresholds
        self.semantic_threshold = 0.65
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

            if keyword.lower() in student_lower or keyword_lemmas.intersection(student_lemmas):
                matched.append(keyword)

        coverage = len(matched) / len(keywords)
        return coverage, matched

    def grade_point(self, student_answer, model_point, keywords):
        """Grade a single point using advanced NLP"""
        semantic_score = self.calculate_semantic_similarity(student_answer, model_point)
        keyword_coverage, matched_keywords = self.check_keyword_coverage(student_answer, keywords)

        student_concepts = self.extract_key_concepts(student_answer)
        model_concepts = self.extract_key_concepts(model_point)

        student_key_words = set([w.lower() for w in student_concepts['keywords']])
        model_key_words = set([w.lower() for w in model_concepts['keywords']])

        concept_overlap = len(student_key_words.intersection(model_key_words)) / max(len(model_key_words), 1)

        combined_score = (
            semantic_score * 0.5 +
            keyword_coverage * 0.3 +
            concept_overlap * 0.2
        )

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
# ENHANCED FEEDBACK GENERATOR (HUMAN-LIKE)
# ===================================

class EnhancedFeedbackGenerator:
    """Generate specific, human-like feedback"""

    def __init__(self):
        self.teacher_names = [
            "Dr. Sarah Mitchell", "Prof. James Anderson", "Dr. Emily Chen",
            "Prof. Michael Roberts", "Dr. Lisa Thompson", "Dr. David Kumar"
        ]

    def generate_point_feedback(self, grading_result, model_point, student_answer, point_number):
        """Generate specific feedback for a point"""
        status = grading_result['status']
        semantic_score = grading_result['semantic_score']
        keyword_coverage = grading_result['keyword_coverage']
        matched_keywords = grading_result['matched_keywords']
        missing_keywords = [kw for kw in grading_result['model_concepts']['keywords'][:8]
                           if kw.lower() not in student_answer.lower()]

        feedback = {'explanation': '', 'suggestion': ''}

        if status == 'correct':
            # Specific positive feedback
            if semantic_score > 0.85 and keyword_coverage > 0.85:
                feedback['explanation'] = f"Point {point_number}: Full marks awarded. Your answer correctly identifies and explains the required concept with appropriate terminology."
            elif len(matched_keywords) >= 3:
                feedback['explanation'] = f"Point {point_number}: Correct. You've covered the key elements, including {', '.join(matched_keywords[:3])}."
            else:
                feedback['explanation'] = f"Point {point_number}: This is acceptable and captures the main idea required for this mark."

        elif status == 'incorrect':
            # Specific feedback on what's missing
            feedback['explanation'] = f"Point {point_number}: No marks awarded. Your response does not address the specific requirement for this marking point."

            if keyword_coverage < 0.3 and missing_keywords:
                feedback['suggestion'] = f"You need to discuss: {', '.join(missing_keywords[:4])}. Your answer went in a different direction than what the question was asking for."
            elif semantic_score < 0.35:
                feedback['suggestion'] = "Your response doesn't match what this marking point requires. Review the question carefully to understand what's being asked."
            else:
                feedback['suggestion'] = f"You touched on related ideas but missed the specific point. Look at the marking scheme and see what concept you left out."

        else:  # partial
            # Clear feedback that it's partial and why
            feedback['explanation'] = f"Point {point_number}: Partial credit only - NO MARKS awarded (partial answers don't count toward your total)."

            if keyword_coverage >= 0.5:
                feedback['suggestion'] = f"You mentioned some relevant terms ({', '.join(matched_keywords[:3])}) but your explanation is incomplete or lacks precision. Please see me to understand exactly what's missing for full marks."
            elif semantic_score >= 0.55:
                feedback['suggestion'] = "You're on the right track but haven't fully developed the answer. The key concepts need to be stated more explicitly. Consult with me to see what would make this a complete answer."
            else:
                feedback['suggestion'] = "Your answer is too vague or doesn't directly address what this point requires. See me during consultation hours to review exactly what the marking scheme expects here."

        return feedback

    def generate_overall_feedback(self, score, max_score, partial_points, points_analysis):
        """Generate comprehensive overall feedback"""
        percentage = (score / max_score) * 100
        correct_count = sum(1 for p in points_analysis if p['status'] == 'correct')
        partial_count = sum(1 for p in points_analysis if p['status'] == 'partial')
        incorrect_count = sum(1 for p in points_analysis if p['status'] == 'incorrect')

        # Opening based on performance
        if percentage >= 85:
            opening = f"You scored {score}/{max_score}. This is a strong performance showing good understanding of the material."
        elif percentage >= 70:
            opening = f"You scored {score}/{max_score}. You've grasped most of the key concepts but there's room to improve."
        elif percentage >= 50:
            opening = f"You scored {score}/{max_score}. Your answer shows partial understanding but significant gaps remain."
        else:
            opening = f"You scored {score}/{max_score}. Your response indicates you need to revisit this topic area more thoroughly."

        # Breakdown
        breakdown = f"Breakdown: {correct_count} point(s) fully correct"
        if partial_count > 0:
            breakdown += f", {partial_count} point(s) partially correct (no marks given)"
        if incorrect_count > 0:
            breakdown += f", {incorrect_count} point(s) incorrect"
        breakdown += "."

        # Specific advice
        advice = ""
        if partial_count > 0:
            advice += f" For the {partial_count} partial point(s), you were close but didn't earn the marks. These are opportunities where a bit more precision or completeness would have earned you credit. Please review these with me to understand the exact requirements."

        if incorrect_count > 0:
            advice += f" The {incorrect_count} incorrect point(s) need attention. Make sure you understand what those marking points were actually asking for."

        if percentage < 70:
            advice += " I recommend reviewing your class notes and the textbook sections on this topic. Focus on understanding the specific concepts that appeared in the marking scheme."

        return f"{opening} {breakdown}{advice}"

    def generate_strengths_and_improvements(self, points_analysis):
        """Generate specific strengths and improvements"""
        strengths = []
        improvements = []

        correct_count = sum(1 for p in points_analysis if p['status'] == 'correct')
        partial_count = sum(1 for p in points_analysis if p['status'] == 'partial')
        incorrect_count = sum(1 for p in points_analysis if p['status'] == 'incorrect')

        # Specific strengths
        if correct_count >= len(points_analysis) * 0.7:
            strengths.append(f"Strong grasp of {correct_count} key concepts")
        elif correct_count > 0:
            strengths.append(f"Correctly answered {correct_count} marking point(s)")

        avg_keyword = np.mean([p['keyword_coverage'] for p in points_analysis])
        if avg_keyword > 0.7:
            strengths.append("Good use of subject-specific terminology")

        # Specific improvements
        if partial_count > 0:
            improvements.append(f"{partial_count} answer(s) need more precision - consult marking scheme")

        if incorrect_count > 0:
            improvements.append(f"Review {incorrect_count} missed concept(s) from the syllabus")

        if avg_keyword < 0.5:
            improvements.append("Need to incorporate more technical terms from course material")

        # Ensure we have content
        if not strengths:
            strengths.append("Attempted to address the question")

        if not improvements:
            improvements.append("Continue practicing exam-style questions")

        return strengths[:5], improvements[:5]


# ===================================
# GRADING SYSTEM ORCHESTRATOR
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

            match = re.search(r'^\s*(\d+)\s*\.', segment)
            if match:
                point_num = match.group(1)
                point_text = segment[match.end():].strip()
            else:
                point_num = str(i)
                point_text = segment

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
        """Grade student answer - PARTIAL ANSWERS DON'T ADD TO SCORE"""
        model_points = self.parse_model_answer(model_answer)

        if not model_points:
            return None

        quality_metrics = self.engine.analyze_answer_quality(student_answer)

        points_analysis = []
        correct_count = 0
        partial_count = 0

        for point in model_points:
            grading_result = self.engine.grade_point(
                student_answer,
                point['text'],
                point['keywords']
            )

            feedback = self.feedback_gen.generate_point_feedback(
                grading_result,
                point['text'],
                student_answer,
                point['number']
            )

            point_result = {
                'id': point['id'],
                'status': grading_result['status'],
                'expected': point['text'],
                'semantic_score': grading_result['semantic_score'],
                'keyword_coverage': grading_result['keyword_coverage'],
                'matched_keywords': grading_result['matched_keywords'],
                'explanation': feedback['explanation'],
                'suggestion': feedback['suggestion']
            }

            points_analysis.append(point_result)

            # ONLY CORRECT ANSWERS GET MARKS
            if grading_result['status'] == 'correct':
                correct_count += 1
            elif grading_result['status'] == 'partial':
                partial_count += 1

        # Calculate final score - only correct answers count
        final_score = int((correct_count / len(model_points)) * max_marks)

        overall_feedback = self.feedback_gen.generate_overall_feedback(
            final_score,
            max_marks,
            partial_count,
            points_analysis
        )

        strengths, improvements = self.feedback_gen.generate_strengths_and_improvements(
            points_analysis
        )

        avg_confidence = np.mean([p['semantic_score'] for p in points_analysis])

        return {
            'score': final_score,
            'max_score': max_marks,
            'correct_points': correct_count,
            'partial_points': partial_count,
            'points_feedback': points_analysis,
            'overall_feedback': overall_feedback,
            'strengths': strengths,
            'improvements': improvements,
            'avg_confidence': avg_confidence,
            'quality_metrics': quality_metrics
        }

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
        elements.append(Paragraph("Answer Assessment Report", self.styles['CustomTitle']))
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
        partial_note = f" ({grading_result['partial_points']} partial - no marks)" if grading_result['partial_points'] > 0 else ""
        score_data = [[
            Paragraph(f"<para align=center><b><font size=36 color='#667eea'>{grading_result['score']}/{grading_result['max_score']}</font></b><br/>"
                     f"<font size=12>{grading_result['correct_points']} correct{partial_note}</font><br/>"
                     f"<font size=10 color='#666'>Analysis confidence: {grading_result.get('avg_confidence', 0)*100:.1f}%</font></para>",
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
        elements.append(Paragraph("Student Answer", self.styles['SectionHeader']))
        elements.append(Paragraph(grading_result['student_answer'].replace('\n', '<br/>'), self.styles['Feedback']))
        elements.append(Spacer(1, 0.3*inch))

        # Detailed Feedback
        elements.append(Paragraph("Point-by-Point Assessment", self.styles['SectionHeader']))

        for point in grading_result['points_feedback']:
            color = colors.HexColor('#d4edda') if point['status'] == 'correct' else \
                   colors.HexColor('#fff3cd') if point['status'] == 'partial' else \
                   colors.HexColor('#f8d7da')

            icon = '✓' if point['status'] == 'correct' else '~' if point['status'] == 'partial' else '✗'

            metrics = f"Match: {point.get('semantic_score', 0)*100:.1f}% | Keywords: {point.get('keyword_coverage', 0)*100:.1f}%"

            point_data = [[
                Paragraph(f"<b>{icon} {point['status'].upper()}</b><br/>"
                         f"<font size=8 color='#666'>{metrics}</font><br/><br/>"
                         f"<i>Required: {point['expected']}</i><br/><br/>"
                         f"{point['explanation']}"
                         f"{('<br/><br/>' + point['suggestion']) if point.get('suggestion') else ''}",
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
        elements.append(Paragraph("Overall Assessment", self.styles['SectionHeader']))
        elements.append(Paragraph(f"<i>Assessed by {grading_result['teacher_name']}</i>", self.styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(grading_result['overall_feedback'], self.styles['Feedback']))
        elements.append(Spacer(1, 0.2*inch))

        # Strengths and Improvements
        strengths_data = [[Paragraph("<b>Strengths</b>", self.styles['Normal'])]]
        for strength in grading_result['strengths']:
            strengths_data.append([Paragraph(f"• {strength}", self.styles['Feedback'])])

        improvements_data = [[Paragraph("<b>Areas to Address</b>", self.styles['Normal'])]]
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
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            f"</font></para>",
            self.styles['Normal']
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer


# ===================================
# INTERACTIVE UI FOR GOOGLE COLAB
# ===================================

def create_advanced_grading_ui():
    """Create interactive UI for grading system"""

    from IPython.display import display, HTML, clear_output
    import ipywidgets as widgets
    from ipywidgets import Layout, Button, VBox, HBox, Text, Textarea, HTML as HTMLWidget
    from datetime import datetime
    import random

    print("🔄 Initializing Grading System...")
    grading_system = AdvancedGradingSystem()
    pdf_generator = PDFReportGenerator()
    print("✓ System ready!")

    # Sample data
    sample_question = "(a) Explain the role of prices in a free market economy. [10]"

    sample_model_answer = """1. In a free market economy, resources are allocated through the ((price mechanism)) where ((demand)) and ((supply)) will interact to allocate resources among competitive and alternative uses. [ENDPOINT]

2. We shall first explain the ((signalling)) and ((incentive)) role of prices in a good market. Suppose consumers decide to eat more strawberries because of their health benefits. This will cause demand for strawberries to increase from D1 to D2. At the initial price, P1 there is a ((shortage)). This will cause price to rise until the shortage is eliminated. [ENDPOINT]

3. The increase in price will cause consumers and producers to act in their own self-interest. The increase in price ((signals)) to producers that consumers wish to buy strawberries. [ENDPOINT]

4. The higher price of strawberries increases the ((profits)) of firms and provides an ((incentive)) for them to increase production of strawberries. [ENDPOINT]

5. The quantity supplied increases from Q1 to Q2. At the same time, the higher price also serves as a signal and incentive for ((consumers)). [ENDPOINT]

6. It signals that strawberries are expensive now and provides an incentive for consumers to cut back on their consumption and look for ((substitutes)). This will cause quantity demanded to decrease from Q3 to Q2. The increase in price from P1 to P2 has resulted in more resources being allocated to strawberry production. [ENDPOINT]

7. The same reasoning applies to ((factor markets)). The increase in demand for strawberries leads to increased demand for strawberry workers. This leads to an increase in ((wages)) of strawberry workers, thus increasing the quantity supplied. The higher wage is both a signal and incentive to the labor force to move into the strawberry industry. [ENDPOINT]

8. Price also serves to ((ration)) scarce goods and services among consumers. When there is an increase in demand, there will be ((excess demand)) at the existing price. This will cause price to rise until quantity demanded equals quantity supplied. [ENDPOINT]

9. Those who are unable to pay the higher prices will be eliminated from the market. Hence, price rations scarce goods to those who can afford to pay the price. [ENDPOINT]

10. When there is an increase in supply, the ((excess supply)) will cause prices to fall until quantity demanded equals quantity supplied. Thus, at a lower market equilibrium price more people can now afford to buy the good. [ENDPOINT]"""

    # Custom CSS
    style = """
    <style>
    .header-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 25px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .step-indicator {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 5px solid #667eea;
    }
    .result-card {
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 25px;
        margin: 15px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .score-display {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        margin: 25px 0;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .score-display .score {
        font-size: 72px;
        font-weight: 700;
        margin: 10px 0;
    }
    .point-correct {
        background: #d4edda;
        border-left: 5px solid #28a745;
        padding: 20px;
        margin: 15px 0;
        border-radius: 8px;
    }
    .point-partial {
        background: #fff3cd;
        border-left: 5px solid #ffc107;
        padding: 20px;
        margin: 15px 0;
        border-radius: 8px;
    }
    .point-incorrect {
        background: #f8d7da;
        border-left: 5px solid #dc3545;
        padding: 20px;
        margin: 15px 0;
        border-radius: 8px;
    }
    .metric-badge {
        display: inline-block;
        background: rgba(255,255,255,0.9);
        padding: 8px 15px;
        border-radius: 20px;
        margin: 5px;
        font-size: 13px;
        font-weight: 600;
    }
    .info-box {
        background: #e7f3ff;
        border-left: 4px solid #2196F3;
        padding: 15px;
        margin: 15px 0;
        border-radius: 5px;
    }
    .section-header {
        color: #667eea;
        font-size: 24px;
        font-weight: 700;
        margin: 25px 0 15px 0;
        padding-bottom: 10px;
        border-bottom: 3px solid #667eea;
    }
    </style>
    """

    display(HTML(style))

    # Header
    header = HTMLWidget(value="""
    <div class="header-box">
        <h1>Answer Grading System</h1>
        <p>AI-Assisted Assessment Tool</p>
    </div>
    """)

    # Step 1: Student Information
    step1_html = HTMLWidget(value="""
    <div class="step-indicator">
        <h2 style="color: #667eea; margin: 0;">Step 1: Student Information</h2>
    </div>
    """)

    student_name = Text(
        placeholder='Enter student name',
        description='Student Name:',
        style={'description_width': 'initial'},
        layout=Layout(width='70%', height='40px')
    )

    student_email = Text(
        placeholder='Enter email address',
        description='Email:',
        style={'description_width': 'initial'},
        layout=Layout(width='70%', height='40px')
    )

    # Step 2: Question Setup
    step2_html = HTMLWidget(value="""
    <div class="step-indicator">
        <h2 style="color: #667eea; margin: 0;">Step 2: Question & Marking Scheme</h2>
    </div>
    <div class="info-box">
        <strong>Format:</strong><br>
        • Separate marking points with <code>[ENDPOINT]</code><br>
        • Mark key terms with <code>(((term)))</code><br>
        • Example: "Resources are ((allocated)) by the ((price mechanism)). [ENDPOINT]"
    </div>
    """)

    question_text = Textarea(
        value=sample_question,
        description='Question:',
        placeholder='Enter question',
        style={'description_width': 'initial'},
        layout=Layout(width='95%', height='100px')
    )

    max_marks = widgets.IntText(
        value=10,
        description='Max Marks:',
        style={'description_width': 'initial'},
        layout=Layout(width='30%')
    )

    model_answer = Textarea(
        value=sample_model_answer,
        description='Marking Scheme:',
        placeholder='Enter marking scheme',
        style={'description_width': 'initial'},
        layout=Layout(width='95%', height='300px')
    )

    load_sample_btn = Button(
        description='Load Sample',
        button_style='info',
        layout=Layout(width='200px', height='40px')
    )

    # Step 3: Student Answer
    step3_html = HTMLWidget(value="""
    <div class="step-indicator">
        <h2 style="color: #667eea; margin: 0;">Step 3: Student Answer</h2>
    </div>
    """)

    student_answer = Textarea(
        placeholder='Enter student answer',
        description='Student Answer:',
        style={'description_width': 'initial'},
        layout=Layout(width='95%', height='300px')
    )

    # Buttons
    grade_btn = Button(
        description='Grade Answer',
        button_style='success',
        layout=Layout(width='200px', height='50px')
    )

    download_pdf_btn = Button(
        description='Download PDF',
        button_style='primary',
        layout=Layout(width='200px', height='50px'),
        disabled=True
    )

    reset_btn = Button(
        description='Reset',
        button_style='warning',
        layout=Layout(width='150px', height='50px')
    )

    output_area = widgets.Output(layout=Layout(width='100%'))

    current_result = {'data': None}

    def load_sample(b):
        question_text.value = sample_question
        model_answer.value = sample_model_answer
        max_marks.value = 10
        with output_area:
            clear_output()
            display(HTML('<div class="info-box">✅ Sample loaded</div>'))

    def grade_answer(b):
        with output_area:
            clear_output()

            if not student_name.value.strip():
                display(HTML('<div class="info-box" style="background: #f8d7da;">❌ Enter student name</div>'))
                return

            if not student_answer.value.strip():
                display(HTML('<div class="info-box" style="background: #f8d7da;">❌ Enter student answer</div>'))
                return

            if not model_answer.value.strip():
                display(HTML('<div class="info-box" style="background: #f8d7da;">❌ Enter marking scheme</div>'))
                return

            display(HTML('<div class="info-box" style="background: #fff3cd;">⏳ Grading in progress...</div>'))

            try:
                result = grading_system.grade_answer(
                    student_answer.value,
                    model_answer.value,
                    max_marks.value
                )

                if result is None:
                    display(HTML('<div class="info-box" style="background: #f8d7da;">❌ Error parsing marking scheme</div>'))
                    return

                current_result['data'] = {
                    'student_name': student_name.value,
                    'email': student_email.value,
                    'question': question_text.value,
                    'student_answer': student_answer.value,
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'time': datetime.now().strftime('%H:%M:%S'),
                    'teacher_name': random.choice(grading_system.feedback_gen.teacher_names),
                    **result
                }

                clear_output()
                display_results(current_result['data'])
                download_pdf_btn.disabled = False

            except Exception as e:
                clear_output()
                display(HTML(f'<div class="info-box" style="background: #f8d7da;">❌ Error: {str(e)}</div>'))

    def display_results(result):
        percentage = (result['score'] / result['max_score']) * 100

        # Score display
        partial_note = f" ({result['partial_points']} partial - no marks)" if result['partial_points'] > 0 else ""
        score_html = f"""
        <div class="score-display">
            <div class="score">{result['score']}/{result['max_score']}</div>
            <div style="font-size: 20px;">{percentage:.1f}%</div>
            <div style="margin-top: 10px; opacity: 0.9;">
                {result['correct_points']} correct{partial_note}
            </div>
        </div>
        """
        display(HTML(score_html))

        # Student info
        info_html = f"""
        <div class="result-card">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> {result['student_name']}</p>
            <p><strong>Email:</strong> {result['email']}</p>
            <p><strong>Date:</strong> {result['date']} at {result['time']}</p>
        </div>
        """
        display(HTML(info_html))

        # Point-by-point
        display(HTML('<h2 class="section-header">Point-by-Point Assessment</h2>'))

        for point in result['points_feedback']:
            status_icon = {'correct': '✓', 'partial': '~', 'incorrect': '✗'}[point['status']]
            status_class = f"point-{point['status']}"

            point_html = f"""
            <div class="{status_class}">
                <h4>{status_icon} {point['status'].upper()}</h4>
                <div style="margin: 10px 0;">
                    <span class="metric-badge">Match: {point['semantic_score']*100:.1f}%</span>
                    <span class="metric-badge">Keywords: {point['keyword_coverage']*100:.1f}%</span>
                </div>
                <div style="background: rgba(255,255,255,0.6); padding: 12px; border-radius: 5px; margin: 10px 0;">
                    <strong>Required:</strong> {point['expected']}
                </div>
                <div style="margin: 10px 0;">
                    {point['explanation']}
                </div>
                {f'<div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.6); border-radius: 5px;">{point["suggestion"]}</div>' if point['suggestion'] else ''}
            </div>
            """
            display(HTML(point_html))

        # Overall feedback
        display(HTML('<h2 class="section-header">Overall Assessment</h2>'))
        feedback_html = f"""
        <div class="result-card">
            <p style="line-height: 1.8;">{result['overall_feedback']}</p>
        </div>
        """
        display(HTML(feedback_html))

        # Strengths/Improvements
        display(HTML('<h2 class="section-header">Summary</h2>'))
        summary_html = '<div class="result-card"><h4>Strengths:</h4><ul>'
        for s in result['strengths']:
            summary_html += f'<li>{s}</li>'
        summary_html += '</ul><h4>Areas to Address:</h4><ul>'
        for i in result['improvements']:
            summary_html += f'<li>{i}</li>'
        summary_html += '</ul></div>'
        display(HTML(summary_html))

    def download_pdf(b):
        if current_result['data'] is None:
            with output_area:
                display(HTML('<div class="info-box" style="background: #f8d7da;">❌ Grade an answer first</div>'))
            return

        try:
            pdf_buffer = pdf_generator.generate_report(current_result['data'])
            filename = f"assessment_{current_result['data']['student_name'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

            with open(filename, 'wb') as f:
                f.write(pdf_buffer.read())

            with output_area:
                display(HTML(f'<div class="info-box" style="background: #d4edda;">✅ PDF saved as {filename}</div>'))

            from google.colab import files
            files.download(filename)

        except Exception as e:
            with output_area:
                display(HTML(f'<div class="info-box" style="background: #f8d7da;">❌ Error: {str(e)}</div>'))

    def reset_form(b):
        student_name.value = ''
        student_email.value = ''
        student_answer.value = ''
        download_pdf_btn.disabled = True
        current_result['data'] = None
        with output_area:
            clear_output()
            display(HTML('<div class="info-box">🔄 Form reset</div>'))

    load_sample_btn.on_click(load_sample)
    grade_btn.on_click(grade_answer)
    download_pdf_btn.on_click(download_pdf)
    reset_btn.on_click(reset_form)

    # Display UI
    display(header)
    display(step1_html)
    display(VBox([student_name, student_email]))
    display(step2_html)
    display(VBox([question_text, max_marks, model_answer, load_sample_btn]))
    display(step3_html)
    display(student_answer)
    display(HBox([grade_btn, download_pdf_btn, reset_btn]))
    display(output_area)

    with output_area:
        display(HTML("""
        <div class="info-box">
            <h3>Instructions:</h3>
            <p>1. Enter student details<br>
            2. Load sample or enter your marking scheme<br>
            3. Enter student answer<br>
            4. Click "Grade Answer"</p>
        </div>
        """))

# Run the UI
create_advanced_grading_ui()