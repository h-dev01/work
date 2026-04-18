# Project Notes

## Overview
- StudyPulse AI is a student performance intelligence system with a React/Vite frontend in `frontend/` and a Django REST backend in `backend/`.
- The frontend runs on port 5000 and proxies `/api` requests to the Django backend on localhost port 8000.
- The backend uses SQLite by default via `backend/db.sqlite3` and includes pre-trained ML model files in `backend/models/`.
- Demo login accounts are configured for local use: admin `admin` / `Admin@12345`, teacher `prof@school.com` / `Teacher@12345`, student `student.uci.1@school.com` / `Student@12345`.

## Replit Setup
- Vite is configured with `host: 0.0.0.0`, `port: 5000`, and `allowedHosts: true` for the Replit preview proxy.
- Frontend API calls use relative `/api` URLs so requests flow through the Vite proxy in development.
- The app workflow should apply Django migrations, start Django on `127.0.0.1:8000`, and start Vite on `0.0.0.0:5000`.
- Django CORS/CSRF settings allow local frontend origins and Replit preview/deployment domains without enabling wildcard CORS.

## Recent Stabilization
- Fixed remaining React runtime typos in admin pages by aligning class state/function references (`fetchClasses`, `setClasses`) across student, subject, ranking, alert, recommendation, and AI hub pages.
- Translated remaining visible French UI labels/messages to English across admin, teacher, student, and AI/prediction pages while keeping backend-required CSV column headers unchanged.