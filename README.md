## VIDEOS
https://drive.google.com/drive/folders/1HO2ZzTbPRUSKKdBQ0EqFLbwGTJgG_k2j?usp=sharing

## Перспективи просування
https://www.notion.so/1d1aa238afc08097be28dd4af9da55f5?pvs=4
---


# Barrier Free – Real-World Accessibility Mapping Platform

Barrier Free is a global accessibility platform built on real, non-generated data. It's not a prototype — it's fully functional and ready for real-world deployment. Whether you're mapping accessibility in Ukraine or across the globe, our mission is simple: help people with disabilities navigate their environment with confidence.

---

## Overview

Barrier Free is a modern web application that combines crowdsourced user input, AI-driven analysis, and real-time map interaction to provide comprehensive accessibility data. The platform is built to be community-first, admin-friendly, and scalable worldwide.

---

## Why It Matters

Accessibility information is essential for people with disabilities. Barrier Free aims to:

- Empower individuals to make informed decisions about venue accessibility
- Encourage inclusion through shared and verified knowledge
- Raise awareness about accessibility issues in public and private spaces
- Support businesses in understanding and improving their accessibility

---

## Key Features

### Real-World Map

- Fully working map with marker clustering for performance
- Real-time visualization of accessibility levels using color codes:
  - 🟢 Green — accessible
  - 🟠 Orange — partially accessible
  - 🔴 Red — inaccessible
  - ⚫ Black — unknown status

### Smart AI Integration

- Users can leave comments on any location
- Every comment triggers AI (powered by GPT) that automatically re-evaluates the accessibility status of the location

### Crowdsourcing + Admin Control

- Anyone can submit proposals for accessibility updates
- Admins can review and moderate changes through secured admin endpoints *(backend ready, frontend in progress)*
- Proposal status is manually updated based on DB inspection and admin review

### User System

- Full authentication with multiple access levels
- Only authenticated users can leave comments or submit proposals
- Custom profiles with optional disability-related settings

### Search + Routing

- Lightning-fast search that immediately focuses on the location
- Multi-point routing system that considers accessibility across locations

---

## Technical Features

### Backend

- FastAPI with a robust RESTful API
- JWT-based authentication and access levels
- PostgreSQL + SQLAlchemy ORM for solid DB design
- AI analysis via OpenAI integration
- Automatic status updates from user feedback

### Frontend

- Vue.js 3 with Pinia state management
- Leaflet.js map with OpenStreetMap data
- Real-time data updates and marker clustering
- Responsive UI using Element Plus

---

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- OpenAI API
- JWT Authentication
- Uvicorn

### Frontend
- Vue.js 3
- Pinia
- Leaflet.js
- Element Plus
- Axios

---

## Future Improvements

### Coming Soon
- Native mobile apps (iOS & Android)
- Offline mode support
- Smarter route planning (accessibility-aware)
- Multi-language support
- Public API access
- User reputation and trust system
- Third-party accessibility data integrations

### Community Contributions

We welcome all contributions! Here’s how you can help:

- Suggest or implement additional accessibility metrics
- Improve UI/UX
- Translate documentation
- Report bugs or provide feedback
- Suggest new features

---

## AI and ML Integration

The future of Barrier Free includes ML-powered accessibility predictions. Our teammate Tima is developing a model to analyze patterns in user feedback and automate classification more intelligently.

Watch Tima’s intro video here:  
[Insert Tima’s video link]

---

## License

[License information to be added]

---

## Contact

[Contact information to be added]