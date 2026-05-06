# 🚕 CabBook Premium - Enterprise Grade Cab Booking Platform

A production-ready, full-stack cab booking application built with **Java (Spring Boot)** and **React**. This platform features an "Uber-style" premium UI, high-precision location services, and a comprehensive administrative control panel.

##  Key Features

### 1. 🗺️High-Precision Map Integration
- **Google Maps API:** Integrated for industry-standard location search, autocomplete, and reverse geocoding.
- **Interactive Map Selection:** Users can move the map to select pickup/dropoff points with auto-address detection.
- **Dark/Voyager Themes:** Premium map styles for a professional navigation feel.
- **OSRM Routing:** Real-time route plotting between pickup and destination.

### 2. 👨‍✈️ Advanced Rider & Driver Experience
- **Split-Screen Dashboard:** Modern UI with control panels and full-screen maps.
- **Trip Dashboard:** Real-time stats including distance, estimated fare, and ETA.
- **Ride Actions:** Seamless ride booking, editing, and cancellation.
- **Driver Verification:** Multi-step verification process for drivers.

### 3. 🛡️ Administrative Control Panel
- **Support Center:** Resolve or delete user complaints with manual resolution logs.
- **Driver Management:** Review documents and verify/approve new drivers.
- **System Metrics:** Real-time overview of active rides, earnings, and user growth.

### 4. 💳 Payments & Receipts
- **Stripe Integration:** Secure payment processing (Web-ready).
- **Automated Receipts:** PDF generation for completed rides using iText.
- **Fare Estimation:** Dynamic pricing based on distance and vehicle type.

### 5. 📡 Real-Time Core
- **WebSockets:** Live status updates (Accepted, Arrived, Ongoing, Completed).
- **State Management:** Robust handling of ride states across frontend and backend.

## 🚀 Technology Stack
- **Backend:** Java 21, Spring Boot, Spring Security (JWT), PostgreSQL, WebSocket.
- **Frontend:** React (Vite), Tailwind CSS, Leaflet.js, Lucide Icons.
- **APIs:** Google Maps (Places, Geocoding), OSRM (Routing).

## 🛠️ Setup Instructions

### Backend
1. Configure `application.properties` with your PostgreSQL and Stripe credentials.
2. Run `./mvnw spring-boot:run`.

### Frontend
1. Run `npm install`.
2. Configure your `GOOGLE_MAPS_API_KEY` in `RiderDashboard.jsx`.
3. Run `npm run dev`.

---
Developed with ❤️ by SAURABH BISWAL 

INCOMPOLETE NEEDS MORE WORK


