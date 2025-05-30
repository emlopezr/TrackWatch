# 🎶 TrackWatch

![Spotify](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)
![Python](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

Stay updated on the latest music releases from your favorite artists. TrackWatch connects with your Spotify account to automatically track your favorite artists, notify you of new releases and add their new releases to a playlist in your Spotify account.

![image](https://github.com/user-attachments/assets/92061a4d-8d46-4487-9bba-ae62dfdb59de)

---

## 🚀 Features
- **Spotify Integration:** Connect your Spotify account and track your favorite artists automatically.
- **Automatic Notifications:** Receive alerts when your followed artists release new music.
- **Playlist Automation:** New releases are added directly to a playlist in your Spotify account.
- **Modern Web UI:** Built with React and TypeScript for a fast, responsive experience.
- **Backend API:** Robust REST API built with Django and Django REST Framework.
- **Task Scheduling:** Automated background jobs for periodic checks and notifications.
- **Image Optimization:** Automated image compression for faster load times.
- **Dependency Management:** Automated updates with Dependabot.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, ESLint
- **Backend:** Django, Django REST Framework, APScheduler, Gunicorn, WhiteNoise
- **Database:** PostgreSQL

## 📦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set up your .env file with Spotify, DB and Resend credentials
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📝 Usage
1. Register and log in with your Spotify account.
2. Select the artists you want to follow.
3. TrackWatch will notify you and update your playlist automatically with new releases.