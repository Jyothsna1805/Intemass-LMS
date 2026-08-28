const { query, execute } = require('./db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

const OLYMPIAD_MCQS = [
    // --- CLASS 9 CBSE AI OLYMPIAD (Q1 - Q15) ---
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "1. Which of the following is a primary domain of Artificial Intelligence?",
        options: [
            { key: "A", text: "Data Science" },
            { key: "B", text: "Computer Vision" },
            { key: "C", text: "Natural Language Processing" },
            { key: "D", text: "All of the above" }
        ],
        answer: "D",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "2. What is the first stage of the AI Project Cycle?",
        options: [
            { key: "A", text: "Data Exploration" },
            { key: "B", text: "Problem Scoping" },
            { key: "C", text: "Modelling" },
            { key: "D", text: "Data Acquisition" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "3. Which Framework helps in scoping an AI problem using Who, What, Where, and Why?",
        options: [
            { key: "A", text: "4W Problem Canvas" },
            { key: "B", text: "SWOT Analysis" },
            { key: "C", text: "5S Framework" },
            { key: "D", text: "PDCA Cycle" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "4. An autonomous self-driving car primarily relies on which AI domain?",
        options: [
            { key: "A", text: "Natural Language Processing" },
            { key: "B", text: "Computer Vision" },
            { key: "C", text: "Voice Recognition" },
            { key: "D", text: "Web Scraping" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "5. Virtual Assistants like Apple Siri or Google Assistant rely heavily on:",
        options: [
            { key: "A", text: "Computer Vision only" },
            { key: "B", text: "Natural Language Processing (NLP)" },
            { key: "C", text: "Rule-based Databases" },
            { key: "D", text: "Graphic Design Algorithms" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "6. Which of the following is NOT an example of AI application in daily life?",
        options: [
            { key: "A", text: "Recommendation Engine on Netflix" },
            { key: "B", text: "Face Unlock on Smartphones" },
            { key: "C", text: "Manual Mechanical Alarm Clock" },
            { key: "D", text: "Spam Filter in Email" }
        ],
        answer: "C",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "7. In the AI Project Cycle, what does Data Exploration involve?",
        options: [
            { key: "A", text: "Collecting raw data from web" },
            { key: "B", text: "Visualizing and understanding data patterns using charts" },
            { key: "C", text: "Deploying model into production" },
            { key: "D", text: "Writing API endpoints" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "8. What is the main objective of Sustainable Development Goal (SDG) 13, which AI helps monitor?",
        options: [
            { key: "A", text: "Quality Education" },
            { key: "B", text: "Climate Action" },
            { key: "C", text: "Zero Hunger" },
            { key: "D", text: "Clean Water" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "9. Which subset relationship accurately describes AI, ML, and Deep Learning?",
        options: [
            { key: "A", text: "AI is a subset of ML, which is a subset of Deep Learning" },
            { key: "B", text: "Deep Learning is a subset of Machine Learning, which is a subset of AI" },
            { key: "C", text: "ML is a subset of Deep Learning, which is independent of AI" },
            { key: "D", text: "AI, ML, and Deep Learning are completely unrelated" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "10. In a Rule-Based AI approach, what is provided by the developer?",
        options: [
            { key: "A", text: "Explicit Rules and Data" },
            { key: "B", text: "Only Data, AI finds the rules" },
            { key: "C", text: "Neural Networks only" },
            { key: "D", text: "No input required" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "11. Smart Thermostats like Nest learn user habits over time using:",
        options: [
            { key: "A", text: "Machine Learning Algorithms" },
            { key: "B", text: "Static Hardware Switches" },
            { key: "C", text: "Manual Dial Timers" },
            { key: "D", text: "Infrared Beams only" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "12. What does 'Bias in AI' refer to?",
        options: [
            { key: "A", text: "High execution speed of algorithms" },
            { key: "B", text: "Unfair or skewed decisions resulting from prejudiced training data" },
            { key: "C", text: "The cost of GPU servers" },
            { key: "D", text: "The size of a database" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "13. What is Data Privacy in AI ethics concerned with?",
        options: [
            { key: "A", text: "Protecting user personal information from unauthorized access and misuse" },
            { key: "B", text: "Increasing internet download speed" },
            { key: "C", text: "Making graphics look realistic" },
            { key: "D", text: "Compressing video files" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "14. Which type of data is represented by numerical tables, spreadsheets, and CSV files?",
        options: [
            { key: "A", text: "Unstructured Data" },
            { key: "B", text: "Structured Data" },
            { key: "C", text: "Audio Data" },
            { key: "D", text: "Thermal Data" }
        ],
        answer: "B",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 9",
        question: "15. Which phase of the AI Project Cycle evaluates the accuracy and performance of the trained model?",
        options: [
            { key: "A", text: "Problem Scoping" },
            { key: "B", text: "Evaluation" },
            { key: "C", text: "Data Acquisition" },
            { key: "D", text: "Data Exploration" }
        ],
        answer: "B",
        max_marks: 5
    },

    // --- CLASS 10 CBSE AI OLYMPIAD (Q16 - Q30) ---
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "16. In Computer Vision, what is a Pixel?",
        options: [
            { key: "A", text: "The smallest controllable element of a digital image" },
            { key: "B", text: "A sound frequency unit" },
            { key: "C", text: "A programming language keyword" },
            { key: "D", text: "A file compression format" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "17. What color channels are present in a standard RGB image format?",
        options: [
            { key: "A", text: "Red, Green, Blue" },
            { key: "B", text: "Red, Yellow, Blue" },
            { key: "C", text: "Cyan, Magenta, Black" },
            { key: "D", text: "Ratio, Gamma, Brightness" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "18. In Natural Language Processing, what is Tokenization?",
        options: [
            { key: "A", text: "Converting text into individual units like words or subwords" },
            { key: "B", text: "Encrypting text into passwords" },
            { key: "C", text: "Translating English to French" },
            { key: "D", text: "Deleting punctuation only" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "19. Which of the following words is commonly considered a 'Stop Word' in NLP preprocessing?",
        options: [
            { key: "A", text: "Photosynthesis" },
            { key: "B", text: "Algorithm" },
            { key: "C", text: "the" },
            { key: "D", text: "Neural" }
        ],
        answer: "C",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "20. What does Lemmatization accomplish in NLP?",
        options: [
            { key: "A", text: "Reduces words to their meaningful base dictionary form (e.g. 'caring' -> 'care')" },
            { key: "B", text: "Removes numbers from sentences" },
            { key: "C", text: "Generates random text" },
            { key: "D", text: "Calculates word count" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "21. In Bag of Words (BoW) text representation, what is recorded?",
        options: [
            { key: "A", text: "Frequency of word occurrences in a document" },
            { key: "B", text: "Grammatical syntax trees" },
            { key: "C", text: "Audio pronunciation speed" },
            { key: "D", text: "Font styling and colors" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "22. Sentiment Analysis algorithm classifies movie reviews into categories such as:",
        options: [
            { key: "A", text: "Positive, Negative, or Neutral" },
            { key: "B", text: "JPEG, PNG, or GIF" },
            { key: "C", text: "High Resolution or Low Resolution" },
            { key: "D", text: "Compiler vs Interpreter" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "23. In Python, which library is widely used for scientific and numerical array manipulations?",
        options: [
            { key: "A", text: "NumPy" },
            { key: "B", text: "HTML5" },
            { key: "C", text: "CSS3" },
            { key: "D", text: "Django" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "24. OpenCV function `cv2.imread()` is used for:",
        options: [
            { key: "A", text: "Reading an image file into memory" },
            { key: "B", text: "Playing audio files" },
            { key: "C", text: "Connecting to SQL server" },
            { key: "D", text: "Sending emails" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "25. Which image filtering technique is used to detect sharp intensity changes (edges) in images?",
        options: [
            { key: "A", text: "Canny Edge Detection" },
            { key: "B", text: "Audio Equalization" },
            { key: "C", text: "Spell Checker" },
            { key: "D", text: "Database Indexing" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "26. What type of machine learning model learns from labeled input-output pairs?",
        options: [
            { key: "A", text: "Supervised Learning" },
            { key: "B", text: "Unsupervised Learning" },
            { key: "C", text: "Reinforcement Learning without feedback" },
            { key: "D", text: "Random Guessing" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "27. Clustering customer groups based on purchasing behavior without prior labels is an example of:",
        options: [
            { key: "A", text: "Unsupervised Learning" },
            { key: "B", text: "Supervised Classification" },
            { key: "C", text: "Rule-based Hardcoding" },
            { key: "D", text: "Linear Regression" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "28. What is TF-IDF in Natural Language Processing?",
        options: [
            { key: "A", text: "Term Frequency - Inverse Document Frequency" },
            { key: "B", text: "Text Format - Internal Data File" },
            { key: "C", text: "Tensor Flow - Integrated Data Framework" },
            { key: "D", text: "Time Frame - Input Division Factor" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "29. In Computer Vision, converting a color image to Grayscale reduces channels to:",
        options: [
            { key: "A", text: "1 channel (intensity 0-255)" },
            { key: "B", text: "3 channels" },
            { key: "C", text: "4 channels" },
            { key: "D", text: "10 channels" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 10",
        question: "30. Which evaluation metric measures the ratio of correctly predicted positive observations to total predicted positives?",
        options: [
            { key: "A", text: "Precision" },
            { key: "B", text: "Recall" },
            { key: "C", text: "Latency" },
            { key: "D", text: "Bandwidth" }
        ],
        answer: "A",
        max_marks: 5
    },

    // --- CLASS 11 CBSE AI/ML OLYMPIAD (Q31 - Q45) ---
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "31. Predicting continuous values like house prices or temperature is a problem of:",
        options: [
            { key: "A", text: "Regression" },
            { key: "B", text: "Classification" },
            { key: "C", text: "Clustering" },
            { key: "D", text: "Dimensionality Reduction" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "32. Classifying emails into 'Spam' or 'Not Spam' (discrete categories) is a problem of:",
        options: [
            { key: "A", text: "Classification" },
            { key: "B", text: "Regression" },
            { key: "C", text: "Principal Component Analysis" },
            { key: "D", text: "Association Rule Mining" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "33. What occurs when a Machine Learning model performs exceptionally on training data but poorly on unseen test data?",
        options: [
            { key: "A", text: "Overfitting" },
            { key: "B", text: "Underfitting" },
            { key: "C", text: "Optimal Generalization" },
            { key: "D", text: "Zero Variance" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "34. What occurs when a model is too simple to capture the underlying pattern in the dataset?",
        options: [
            { key: "A", text: "Underfitting" },
            { key: "B", text: "Overfitting" },
            { key: "C", text: "High Precision" },
            { key: "D", text: "Perfect Recall" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "35. In K-Nearest Neighbors (KNN) algorithm, what parameter 'K' represents?",
        options: [
            { key: "A", text: "The number of nearest data points considered for classification" },
            { key: "B", text: "The number of features in the dataset" },
            { key: "C", text: "The learning rate" },
            { key: "D", text: "The number of decision trees" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "36. Which distance metric is most commonly used in KNN for Euclidean space?",
        options: [
            { key: "A", text: "Euclidean Distance sqrt((x2-x1)^2 + (y2-y1)^2)" },
            { key: "B", text: "Cosine Similarity only" },
            { key: "C", text: "Hamming Distance for strings" },
            { key: "D", text: "Jaccard Index" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "37. In Decision Tree algorithm, what measure evaluates impurity of a split node?",
        options: [
            { key: "A", text: "Gini Impurity or Entropy" },
            { key: "B", text: "Mean Squared Error only" },
            { key: "C", text: "R-squared value" },
            { key: "D", text: "Standard Deviation" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "38. What is the main function of the Training Dataset in ML workflow?",
        options: [
            { key: "A", text: "Used to train and fit the model weights and parameters" },
            { key: "B", text: "Used exclusively for final grade calculation" },
            { key: "C", text: "Used to publish web dashboards" },
            { key: "D", text: "Stored without processing" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "39. Why do we keep a separate Test Dataset during model building?",
        options: [
            { key: "A", text: "To evaluate unbiased generalisation accuracy on unseen data" },
            { key: "B", text: "To increase model training speed" },
            { key: "C", text: "To reduce memory storage requirements" },
            { key: "D", text: "To replace training data" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "40. In K-Means Clustering algorithm, what does 'Centroid' represent?",
        options: [
            { key: "A", text: "The mean center point of all data points belonging to a cluster" },
            { key: "B", text: "The maximum value in a column" },
            { key: "C", text: "An outlier point" },
            { key: "D", text: "The root node of a tree" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "41. What is Linear Regression used for?",
        options: [
            { key: "A", text: "Modelling linear relationship between independent variable X and dependent variable Y" },
            { key: "B", text: "Sorting words alphabetically" },
            { key: "C", text: "Segmenting images into objects" },
            { key: "D", text: "Scraping HTML tables" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "42. In equation Y = mX + c, what does 'm' represent?",
        options: [
            { key: "A", text: "Slope (Gradient) of the line" },
            { key: "B", text: "Y-intercept" },
            { key: "C", text: "Mean error" },
            { key: "D", text: "Variance" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "43. What is Logistic Regression primarily used for?",
        options: [
            { key: "A", text: "Binary Classification problems (probability output between 0 and 1)" },
            { key: "B", text: "Continuous price forecasting" },
            { key: "C", text: "3D Rendering" },
            { key: "D", text: "Database indexing" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "44. In Confusion Matrix, what is a 'False Positive' (Type I Error)?",
        options: [
            { key: "A", text: "Negative sample incorrectly predicted as Positive" },
            { key: "B", text: "Positive sample correctly predicted as Positive" },
            { key: "C", text: "Negative sample correctly predicted as Negative" },
            { key: "D", text: "Positive sample incorrectly predicted as Negative" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 11",
        question: "45. What is the mathematical formula for Accuracy from a Confusion Matrix?",
        options: [
            { key: "A", text: "(TP + TN) / (TP + TN + FP + FN)" },
            { key: "B", text: "TP / (TP + FP)" },
            { key: "C", text: "TP / (TP + FN)" },
            { key: "D", text: "FP / (FP + TN)" }
        ],
        answer: "A",
        max_marks: 5
    },

    // --- CLASS 12 CBSE AI/ML OLYMPIAD (Q46 - Q60) ---
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "46. What is the basic building block unit of an Artificial Neural Network (ANN)?",
        options: [
            { key: "A", text: "Perceptron (Artificial Neuron)" },
            { key: "B", text: "Decision Boundary" },
            { key: "C", text: "Kernel Function" },
            { key: "D", text: "Eigenvector" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "47. Which mathematical function introduces non-linearity into a neural network layer?",
        options: [
            { key: "A", text: "Activation Function (e.g. ReLU, Sigmoid)" },
            { key: "B", text: "Linear Identity Function" },
            { key: "C", text: "Determinant" },
            { key: "D", text: "Sorting Algorithm" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "48. What is the output range of the Sigmoid Activation Function?",
        options: [
            { key: "A", text: "(0, 1)" },
            { key: "B", text: "(-1, +1)" },
            { key: "C", text: "(0, infinity)" },
            { key: "D", text: "(-infinity, +infinity)" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "49. What does ReLU stand for in Deep Learning?",
        options: [
            { key: "A", text: "Rectified Linear Unit f(x) = max(0, x)" },
            { key: "B", text: "Random Element Layer Unit" },
            { key: "C", text: "Recursive Logic Unit" },
            { key: "D", text: "Ratio Elevation Log Unit" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "50. Which algorithm is used to calculate gradients of loss function with respect to neural network weights using chain rule?",
        options: [
            { key: "A", text: "Backpropagation" },
            { key: "B", text: "Forward Selection" },
            { key: "C", text: "Binary Search" },
            { key: "D", text: "Dijkstra Algorithm" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "51. Convolutional Neural Networks (CNNs) are specialized architecture primarily designed for:",
        options: [
            { key: "A", text: "Grid data processing like Digital Images & Video frames" },
            { key: "B", text: "Excel tabular sorting" },
            { key: "C", text: "Audio tone generation only" },
            { key: "D", text: "Hardware memory management" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "52. In CNN architecture, what operation reduces spatial dimensions of feature maps (e.g., Max Pooling)?",
        options: [
            { key: "A", text: "Pooling Layer" },
            { key: "B", text: "Fully Connected Dense Layer" },
            { key: "C", text: "Softmax Layer" },
            { key: "D", text: "Embedding Layer" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "53. What is the Harmonic Mean of Precision and Recall?",
        options: [
            { key: "A", text: "F1 Score = 2 * (Precision * Recall) / (Precision + Recall)" },
            { key: "B", text: "Accuracy" },
            { key: "C", text: "ROC AUC Area" },
            { key: "D", text: "Mean Absolute Error" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "54. What optimization algorithm iteratively updates neural network parameters in opposite direction of gradient of loss?",
        options: [
            { key: "A", text: "Gradient Descent (e.g. Adam, SGD)" },
            { key: "B", text: "Bubble Sort" },
            { key: "C", text: "Breadth First Search" },
            { key: "D", text: "Monte Carlo Tree Search" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "55. What is 'Learning Rate' hyperparameter in Gradient Descent?",
        options: [
            { key: "A", text: "The step size taken towards the minimum of loss function at each iteration" },
            { key: "B", text: "The percentage of CPU memory used" },
            { key: "C", text: "The size of image resolution" },
            { key: "D", text: "The number of epochs" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "56. Which technique randomly deactivates a fraction of neurons during training to prevent co-adaptation and overfitting?",
        options: [
            { key: "A", text: "Dropout Regularization" },
            { key: "B", text: "Batch Normalization" },
            { key: "C", text: "Zero Padding" },
            { key: "D", text: "Data Imputation" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "57. In NLP, Large Language Models (LLMs) like GPT rely heavily on which modern deep learning architecture?",
        options: [
            { key: "A", text: "Transformer Architecture with Self-Attention mechanism" },
            { key: "B", text: "Naive Bayes Classifier" },
            { key: "C", text: "Support Vector Machines (SVM)" },
            { key: "D", text: "Decision Trees" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "58. What is 'Transfer Learning' in Deep Learning?",
        options: [
            { key: "A", text: "Reusing a pre-trained model on a large dataset as starting point for a new task" },
            { key: "B", text: "Transferring code via USB drive" },
            { key: "C", text: "Converting Python code to C++" },
            { key: "D", text: "Downloading raw CSV files" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "59. In generative AI, what framework consists of a Generator network and a Discriminator network competing against each other?",
        options: [
            { key: "A", text: "Generative Adversarial Networks (GANs)" },
            { key: "B", text: "Recurrent Neural Networks (RNNs)" },
            { key: "C", text: "Autoencoders" },
            { key: "D", text: "Principal Component Analysis (PCA)" }
        ],
        answer: "A",
        max_marks: 5
    },
    {
        subject: "CBSE AI/ML Olympiad - Class 12",
        question: "60. Which evaluation metric measures model error as average of absolute differences between predictions and actual values?",
        options: [
            { key: "A", text: "Mean Absolute Error (MAE)" },
            { key: "B", text: "Confusion Matrix" },
            { key: "C", text: "Cosine Distance" },
            { key: "D", text: "Perplexity" }
        ],
        answer: "A",
        max_marks: 5
    }
];

const seedOlympiadMCQs = async () => {
    try {
        console.log("🌱 Seeding 60 CBSE AI/ML Olympiad MCQs (Class 9 - Class 12)...");
        const teacherRes = await query("SELECT id FROM users WHERE role IN ('teacher', 'master') LIMIT 1");
        const creatorId = teacherRes[0] ? teacherRes[0].id : '0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab';

        let insertedCount = 0;
        for (const mcq of OLYMPIAD_MCQS) {
            // Check if question already exists
            let existing;
            if (process.env.DB_TYPE === 'postgres') {
                existing = await query("SELECT id FROM questions WHERE question_text = $1", [mcq.question]);
            } else {
                existing = await query("SELECT id FROM questions WHERE question_text = ?", [mcq.question]);
            }

            if (existing.length === 0) {
                const qId = generateId();
                const mcqOptionsJson = JSON.stringify(mcq.options);

                if (process.env.DB_TYPE === 'postgres') {
                    await execute(
                        `INSERT INTO questions (id, created_by, question_text, standard_answer, type, subject, max_marks, mcq_options_json, created_at)
                         VALUES ($1, $2, $3, $4, 'mcq', $5, $6, $7, NOW())`,
                        [qId, creatorId, mcq.question, mcq.answer, mcq.subject, mcq.max_marks, mcqOptionsJson]
                    );
                } else {
                    await execute(
                        `INSERT INTO questions (id, created_by, question_text, standard_answer, type, subject, max_marks, mcq_options_json, created_at)
                         VALUES (?, ?, ?, ?, 'mcq', ?, ?, ?, CURRENT_TIMESTAMP)`,
                        [qId, creatorId, mcq.question, mcq.answer, mcq.subject, mcq.max_marks, mcqOptionsJson]
                    );
                }
                insertedCount++;
            }
        }
        console.log(`✓ Seeded ${insertedCount} new CBSE AI/ML Olympiad MCQs into Global Databank!`);
    } catch (err) {
        console.error("Error seeding Olympiad MCQs:", err);
    }
};

module.exports = { seedOlympiadMCQs };
