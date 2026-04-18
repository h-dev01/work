# 🎓 Student Performance Prediction System

![EST Oujda Logo](frontend/src/assets/images/logoEST.jpg)

**École Supérieure de Technologie - Oujda** | **PFE 2024/2025**

---

## 📋 About The Project
An intelligent platform designed to revolutionize educational monitoring. By combining an interactive dashboard with **Machine Learning** algorithms, this tool predicts student performance, detects at-risk students early, and provides personalized recommendations.

### 🌟 Key Features
- **🔮 AI Prediction**: Future grade estimation & student classification (Excellence, Average, At-Risk).
- **📊 Intuitive Dashboards**: Dedicated views for Admins, Teachers, and Students.
- **🚀 Performance**: Modern architecture with React, Django, and optimized data loading.

---

## 📸 Screenshots Showcase

### 🏫 Admin Dashboard
Global school statistics and prediction flow management.

| Admin Dashboard | Prediction Flow |
|:---:|:---:|
| ![Admin Dashboard](screenshots/admin_dashboard.png) | ![Prediction Flow](screenshots/prediction_flow.png) |
| *Overview of school stats* | *AI prediction logic visualization* |

### 👩‍🏫 Teacher Dashboard
Track classes, view ML analysis, and identify struggling students.

| Teacher View | Machine Learning Analysis |
|:---:|:---:|
| ![Teacher View](screenshots/teacher_view.png) | ![ML Results](screenshots/ml_result.png) |
| *Detailed class monitoring* | *Classification results & insights* |

### 🎓 Student Dashboard
Personalized progress tracking.

![Student View](screenshots/student_view.png)
*Personal space for students*

---

## 🧠 The AI Core
Powered by a **Random Forest** model trained on the [UCI Student Performance Dataset](https://archive.ics.uci.edu/ml/datasets/Student+Performance).
- **Accuracy**: ~92% for Classification
- **MAE**: < 1.5 points for Grade Regression

> *See the [ML Repository](https://github.com/anass-elamrany/student-performance-ml) for technical details.*

---

## 🛠️ Tech Stack

| Frontend | Backend | AI & Data |
| :--- | :--- | :--- |
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React 19** | ![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white) **Django 5** | ![Scikit](https://img.shields.io/badge/scikit_learn-F7931E?style=flat&logo=scikit-learn&logoColor=white) **Scikit-Learn** |
| Material UI | DRF (REST API) | Pandas / NumPy |
| Recharts | PostgreSQL / SQLite | Jupyter |

---

## 🚀 Getting Started

### Option 1: Docker (Recommended)
Run the entire stack with one command:
```bash
docker-compose up --build
```
- **App**: [http://localhost:3000](http://localhost:3000)

### Option 2: Manual Install

**1. Backend**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

<center>
    <p>Made with ❤️ at EST Oujda</p>
    <p>
        <a href="https://github.com/anass-elamrany">Anass El Amrany</a> • 
        <a href="https://github.com/awittygenlteman">El khadir Safouane</a> • 
        <a href="https://github.com/MaryameDani">Maryame Dani</a>
    </p>
    <p>© 2025 All Rights Reserved</p>
</center>