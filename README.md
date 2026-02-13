# 🌬️ Airyze AQI Monitor

5th Semester - Software Construction course project

**Airyze AQI Monitor** is a comprehensive real-time air quality monitoring application that helps users track air pollution levels, view historical data, and receive personalized alerts. The application provides interactive maps, detailed pollutant information, and health recommendations based on current air quality conditions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Key Components](#key-components)
- [How It Works](#how-it-works)
- [Cron Jobs & Alerts](#cron-jobs--alerts)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**Purpose**: Airyze AQI Monitor is designed to provide real-time air quality information to help users make informed decisions about outdoor activities and protect their health. The application focuses on monitoring air quality across Pakistan's major cities and allows users to check AQI for any location worldwide.

**What It Does**:
- Fetches real-time air quality data from OpenWeather API
- Displays AQI (Air Quality Index) on an interactive map
- Shows detailed pollutant breakdowns (PM2.5, PM10, O3, NO2, SO2, CO)
- Provides health recommendations based on AQI levels
- Tracks historical AQI data for major cities
- Sends email alerts to registered users about air quality changes
- Visualizes data through charts and graphs

---

## ✨ Features

### Core Features
1. **Interactive Map View**
   - Click anywhere on the map to get real-time AQI data
   - Auto-detect user location
   - Visual color-coding based on AQI levels

2. **Real-Time AQI Monitoring**
   - Current air quality index (1-5 scale)
   - Detailed pollutant components
   - Location coordinates display

3. **Major Cities Dashboard**
   - AQI data for 8 major Pakistani cities:
     - Karachi, Lahore, Islamabad, Rawalpindi
     - Peshawar, Quetta, Faisalabad, Multan
   - Search functionality to filter cities
   - Real-time updates

4. **Historical Data & Analytics**
   - Daily AQI line charts (30-day history)
   - AQI category frequency charts
   - Historical data stored in PostgreSQL

5. **User Authentication**
   - User registration and login
   - Secure password hashing (bcrypt)
   - Session management

6. **Email Alerts**
   - Daily AQI reports (8:00 AM)
   - Significant change alerts (every 30 minutes)
   - Personalized health recommendations

7. **Health Recommendations**
   - Context-aware advice based on AQI levels
   - Preventive measures for different air quality conditions
   - Color-coded AQI status indicators

---

## 🛠 Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4.1.17** - Styling
- **React Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks
- **nodemailer** - Email service
- **dotenv** - Environment variables

### External APIs
- **OpenWeather API** - Air quality data
- **Open-Meteo API** - Historical air quality data

---

## 📁 Project Structure

```
Airyze AQI/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── aqiController.js
│   │   ├── authControllers.js
│   │   ├── historyController.js
│   │   └── majorCitiesController.js
│   ├── data/                 # Static data
│   │   └── cities.js
│   ├── jobs/                 # Scheduled tasks
│   │   └── aqiAlerts.js
│   ├── routes/               # API routes
│   │   ├── aqiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── historyRoutes.js
│   │   └── majorCitiesRoutes.js
│   ├── services/             # Business logic
│   │   ├── alertService.js
│   │   ├── aqiHelper.js
│   │   ├── cityCoords.js
│   │   ├── email.js
│   │   ├── fetchAQI.js
│   │   └── openweatherService.js
│   ├── db.js                 # Database connection
│   ├── server.js             # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API service functions
│   │   │   ├── aqiService.js
│   │   │   ├── authService.js
│   │   │   └── historyService.js
│   │   ├── components/       # React components
│   │   │   ├── aqiInfo.jsx
│   │   │   ├── AQIMeaningCards.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── cityAQIGrid.jsx
│   │   │   ├── DailyAQILineChart.jsx
│   │   │   ├── FrequencyChart.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── pages/            # Page components
│   │   │   └── Dashboard.jsx
│   │   ├── utils/            # Utility functions
│   │   │   └── aqiLevels.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── images/               # Static images
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- OpenWeather API key
- Email service credentials (for alerts)

### Step 1: Clone the Repository
```bash
cd "Airyze AQI"
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Database Setup
Create a PostgreSQL database and run the following SQL to create tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    last_aqi INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AQI data table
CREATE TABLE aqi_data (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    aqi INTEGER,
    co DECIMAL(10, 2),
    no DECIMAL(10, 2),
    no2 DECIMAL(10, 2),
    o3 DECIMAL(10, 2),
    so2 DECIMAL(10, 2),
    pm2_5 DECIMAL(10, 2),
    pm10 DECIMAL(10, 2),
    nh3 DECIMAL(10, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 5: Environment Variables
Create a `.env` file in the `backend` directory (see [Environment Variables](#environment-variables) section).

### Step 6: Run the Application

**Backend:**
```bash
cd backend
npm start
# or for development with nodemon
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173` (Vite default)
- Backend: `http://localhost:5000`

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/airyze_aqi

# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_api_key_here
OPENWEATHER_KEY=your_openweather_api_key_here

# Email Service (for alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### Getting API Keys

1. **OpenWeather API Key**:
   - Sign up at [OpenWeather](https://openweathermap.org/api)
   - Navigate to API keys section
   - Copy your API key

2. **Email Service**:
   - For Gmail: Use App Password (not regular password)
   - Enable 2FA and generate app password in Google Account settings

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Get AQI by Coordinates
```http
GET /api/aqi?lat={latitude}&lon={longitude}
```

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response:**
```json
{
  "success": true,
  "aqi": 3,
  "components": {
    "co": 250.5,
    "no": 0.1,
    "no2": 15.2,
    "o3": 85.3,
    "so2": 2.5,
    "pm2_5": 25.8,
    "pm10": 45.2,
    "nh3": 0.5
  }
}
```

#### 2. Get Major Cities AQI
```http
GET /api/pak_cities
```

**Response:**
```json
[
  {
    "name": "Karachi",
    "aqi": 4,
    "components": { ... },
    "updatedAt": 1234567890
  },
  ...
]
```

#### 3. Get City History
```http
GET /api/history?city={cityName}
```

**Query Parameters:**
- `city` (required): City name

**Response:**
```json
[
  {
    "location_name": "Karachi",
    "aqi": 3,
    "pm2_5": 25.5,
    "pm10": 45.2,
    "o3": 85.3,
    "no2": 15.2,
    "so2": 2.5,
    "date": "2024-01-15"
  },
  ...
]
```

#### 4. Fetch Historical Data
```http
POST /api/history/fetch
```

Fetches and stores 30 days of historical AQI data for all major cities.

#### 5. User Registration
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "city": "Karachi"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Karachi"
  }
}
```

#### 6. User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Karachi"
  }
}
```

---

## 🗄 Database Schema

### Users Table
Stores user account information and preferences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique user ID |
| `name` | VARCHAR(255) | User's full name |
| `email` | VARCHAR(255) UNIQUE | User's email address |
| `password` | VARCHAR(255) | Hashed password (bcrypt) |
| `city` | VARCHAR(255) | User's preferred city for alerts |
| `last_aqi` | INTEGER | Last recorded AQI for change detection |
| `created_at` | TIMESTAMP | Account creation timestamp |

### AQI Data Table
Stores historical air quality measurements.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique record ID |
| `location_name` | VARCHAR(255) | City/location name |
| `lat` | DECIMAL(10,8) | Latitude |
| `lon` | DECIMAL(11,8) | Longitude |
| `aqi` | INTEGER | Air Quality Index (1-5) |
| `co` | DECIMAL(10,2) | Carbon Monoxide (μg/m³) |
| `no` | DECIMAL(10,2) | Nitrogen Monoxide (μg/m³) |
| `no2` | DECIMAL(10,2) | Nitrogen Dioxide (μg/m³) |
| `o3` | DECIMAL(10,2) | Ozone (μg/m³) |
| `so2` | DECIMAL(10,2) | Sulphur Dioxide (μg/m³) |
| `pm2_5` | DECIMAL(10,2) | PM2.5 particles (μg/m³) |
| `pm10` | DECIMAL(10,2) | PM10 particles (μg/m³) |
| `nh3` | DECIMAL(10,2) | Ammonia (μg/m³) |
| `timestamp` | TIMESTAMP | Measurement timestamp |
| `created_at` | TIMESTAMP | Record creation timestamp |

---

## 🧩 Key Components

### Frontend Components

1. **Dashboard.jsx**
   - Main page component
   - Manages state and coordinates all sub-components
   - Handles user authentication state

2. **MapView.jsx**
   - Interactive Leaflet map
   - Handles map clicks and location selection
   - Displays markers with AQI color coding

3. **AQIInfo.jsx**
   - Displays current AQI value and status
   - Shows pollutant breakdown
   - Color-coded AQI indicators

4. **CityAQIGrid.jsx**
   - Grid layout for major cities
   - Real-time AQI cards
   - Search functionality

5. **DailyAQILineChart.jsx**
   - Line chart showing 30-day AQI trends
   - Uses Chart.js for visualization

6. **FrequencyChart.jsx**
   - Bar chart showing AQI category frequency
   - Statistical analysis visualization

7. **Recommendations.jsx**
   - Health advice based on AQI levels
   - Preventive measures display

8. **AuthModal.jsx**
   - User registration and login modal
   - Form validation and error handling

### Backend Services

1. **openweatherService.js**
   - Fetches real-time AQI from OpenWeather API
   - Handles API errors and responses

2. **aqiHelper.js**
   - AQI calculation utilities
   - City coordinate lookup
   - Health recommendations generator

3. **email.js**
   - Email sending service
   - Alert email templates

4. **alertService.js**
   - Alert generation logic
   - User notification management

---

## 🔄 How It Works

### Data Flow

1. **User Interaction**:
   - User clicks on map or selects a city
   - Frontend captures coordinates/city name

2. **API Request**:
   - Frontend sends request to backend API
   - Backend validates request parameters

3. **External API Call**:
   - Backend calls OpenWeather API with coordinates
   - Receives raw air quality data

4. **Data Processing**:
   - Backend processes and formats data
   - Calculates AQI levels and categories
   - Generates health recommendations

5. **Response**:
   - Backend returns formatted JSON
   - Frontend updates UI components
   - Charts and visualizations refresh

### AQI Calculation

The application uses the **US EPA AQI standard** to calculate air quality indices:

- **AQI 1 (Good)**: 0-50 - Green
- **AQI 2 (Fair)**: 51-100 - Light Green
- **AQI 3 (Moderate)**: 101-150 - Yellow
- **AQI 4 (Poor)**: 151-200 - Orange
- **AQI 5 (Very Poor)**: 201-500 - Red

The overall AQI is calculated as the maximum AQI value among all pollutants (PM2.5, PM10, O3, NO2, SO2).

---

## ⏰ Cron Jobs & Alerts

The application includes automated scheduled tasks:

### 1. Daily Alert (8:00 AM)
- Runs every day at 8:00 AM
- Sends AQI report to all registered users
- Includes current AQI and health recommendations
- Updates `last_aqi` in database

### 2. Change Detection (Every 30 minutes)
- Monitors AQI changes for all users
- Sends alert if AQI level changes significantly
- Helps users stay informed about air quality fluctuations

### Configuration
Cron jobs are configured in `backend/jobs/aqiAlerts.js`:
- Uses `node-cron` for scheduling
- Automatically starts when backend server runs
- Logs all alert activities

---

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Set Environment Variables**:
   - Add all required environment variables in deployment platform

2. **Database**:
   - Use managed PostgreSQL service (Railway, Supabase, etc.)
   - Update `DATABASE_URL` in environment variables

3. **Build Command**:
   ```bash
   npm install
   ```

4. **Start Command**:
   ```bash
   node server.js
   ```

### Frontend Deployment (Vite)

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Deploy `dist` folder to Vercel, Netlify, or any static hosting
   - Update API base URL in frontend code for production

3. **Environment**:
   - Update API endpoint URLs in `frontend/src/api/*.js` files

### Recommended Platforms
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Heroku
- **Database**: Railway PostgreSQL, Supabase, AWS RDS

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test all new features
- Update documentation as needed

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📧 Support

For issues, questions, or contributions, please open an issue on the repository.

---

## 🎯 Future Enhancements

Based on the roadmap, potential future features include:
- Mobile app version
- Push notifications
- More cities and regions
- Advanced analytics dashboard
- Weather integration
- Air quality forecasts
- Social sharing features

---

**Built with ❤️ for cleaner air and healthier lives**

