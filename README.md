# 🩺 MediVision – AI Healthcare Assistant

<div align="center">

### AI-Powered Disease Detection, Infection Localization & Explainable Medical Imaging

Built using Deep Learning, Computer Vision, DenseNet201, Segmentation, and Explainable AI (Grad-CAM).

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2-orange)
![Python](https://img.shields.io/badge/Python-3.10+-blue)

</div>

---

## 📖 Overview

MediVision is an AI-powered healthcare intelligence platform designed to assist in the analysis of chest X-ray images. The system combines disease classification, infection localization, and explainable AI into a unified diagnostic workflow.

The platform leverages a DenseNet201-based deep learning architecture to identify COVID-19, Pneumonia, and Normal chest X-ray cases while simultaneously highlighting infected regions through segmentation and Grad-CAM visualizations.

By providing both predictions and visual explanations, MediVision improves interpretability and supports clinical decision-making.

---

## ✨ Key Features

### 🔍 Disease Classification

* COVID-19 Detection
* Pneumonia Detection
* Normal Chest X-Ray Identification
* Multi-class Deep Learning Prediction

### 🫁 Infection Localization

* Lung Region Segmentation
* Pixel-Level Infection Detection
* Region Highlighting for Better Interpretation

### 🧠 Explainable AI (XAI)

* Grad-CAM Heatmaps
* Visual Explanation of Predictions
* Improved Transparency and Trust

### 💬 AI Medical Assistant

* Medical Chat Support
* Healthcare Information Assistance
* Symptom-Based Guidance

### 🔐 Secure Authentication

* JWT Authentication
* User Registration & Login
* Protected Routes
* MongoDB User Management

### 📊 Dashboard Analytics

* Analysis History
* User Statistics
* Medical Report Tracking

---

## 🏗️ System Architecture

Input Chest X-Ray

↓
Image Preprocessing (CLAHE + Normalization)

↓
DenseNet201 Feature Extraction

↓
Disease Classification

↓
Infection Segmentation

↓
Grad-CAM Explainability

↓
Diagnostic Output

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js
* JWT Authentication
* Mongoose

### AI & Machine Learning

* Python
* TensorFlow / Keras
* DenseNet201
* OpenCV
* Grad-CAM

### Database

* MongoDB Atlas

---

## 📂 Dataset

The model is trained on chest X-ray datasets containing:

* COVID-19 Cases
* Pneumonia Cases
* Normal Cases

Dataset Characteristics:

* ~16,000 Medical Images
* Classification Labels
* Segmentation Masks
* Input Resolution: 224 × 224

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/kartik-mahajan-ai/MediVision.git
cd MediVision
```

### Install Frontend

```bash
npm install
```

### Install Backend

```bash
cd server
npm install
cd ..
```

### Install Python Dependencies

```bash
cd server

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

cd ..
```

---

## ⚙️ Environment Variables

Create:

### Root .env

```env
VITE_API_URL=http://localhost:5001/api
```

### Server .env

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

PERPLEXITY_API_KEY=your_api_key

PORT=5001
```

---

## ▶️ Running the Project

### Terminal 1 – Backend

```bash
cd server
npm start
```

### Terminal 2 – AI Service

```bash
cd server

venv\Scripts\activate

python model_api.py
```

### Terminal 3 – Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 📊 Applications

* Clinical Decision Support
* Radiology Assistance
* Emergency Disease Screening
* Telemedicine Platforms
* Medical Research

---

## 🔮 Future Improvements

* Additional Disease Categories
* Real-Time Inference Optimization
* Larger Medical Datasets
* Advanced Explainable AI Techniques
* Cloud Deployment & Scalability

---

## ⚠️ Disclaimer

MediVision is intended for educational, research, and decision-support purposes only.

This system is not a replacement for professional medical diagnosis, radiology review, or clinical judgment.

Always consult qualified healthcare professionals for medical decisions.

---

## 👨‍💻 Developer

### Kartik Mahajan

B.Tech Computer Science Engineering
Bennett University

Passionate about Artificial Intelligence, Medical Imaging, Computer Vision, and Healthcare Technology.

---

⭐ If you found this project useful, consider starring the repository.
