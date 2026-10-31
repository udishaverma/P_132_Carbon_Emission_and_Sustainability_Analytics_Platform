# CO₂ Emissions & Sustainability Analytics Platform

An interactive environmental analytics and machine-learning platform for exploring carbon dioxide emissions, predicting future emissions, and examining the relationship between renewable energy adoption and carbon emissions across countries.

## Overview

This project uses data from [Our World in Data](https://ourworldindata.org/) to analyse historical CO₂ emissions and energy-related indicators. It combines data analytics, machine learning, time-series forecasting and interactive visualizations in a single web application.

The primary modelling dataset covers **79 countries from 2000 to 2022**, containing 1,817 country-year observations and 13 predictor variables.

## Features

The platform consists of five main sections:

- **Overview:** Global CO₂ emission statistics, country rankings, historical trends, model performance and a geographical emissions map.
- **Data Explorer:** Explore country-specific emissions, energy indicators and economic variables through interactive charts, filters and tables.
- **Prediction:** Generate CO₂ emission estimates using a trained Gradient Boosting regression model.
- **Forecast:** Explore historical emissions and future conditional projections using a lag-based time-series regression model.
- **Renewable Impact:** Examine renewable-energy adoption, emissions per capita, correlation patterns and controlled regression associations.

Additional interface features include a reusable country selector and application-wide light and dark themes.

## Machine Learning & Data Analysis

The project includes nine Jupyter notebooks covering:

1. Data Understanding
2. Data Cleaning
3. Feature Engineering
4. Exploratory Data Analysis
5. Regression Modeling
6. Time-Series Forecasting
7. Model Evaluation
8. Renewable Energy Impact Analysis
9. Visualization Generation

Three regression algorithms were compared: Linear Regression, Random Forest Regressor and Gradient Boosting Regressor.

### Regression Model Performance

| Model | MAE (Mt) | RMSE (Mt) | R² |
|---|---:|---:|---:|
| Gradient Boosting | 22.5743 | 68.9022 | 0.9973 |
| Random Forest | 18.4689 | 85.7052 | 0.9959 |
| Linear Regression | 76.7764 | 135.3426 | 0.9898 |

Gradient Boosting was selected as the primary regression model based on its validation and held-out test performance.

The forecasting component uses a Gradient Boosting model with lagged CO₂ features and recursive multi-year predictions. The resulting projections are conditional on the latest available socioeconomic and energy indicators.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- HTML5 and CSS3
- Recharts
- React Router
- React Simple Maps

**Backend**
- Python
- FastAPI
- REST APIs
- Pandas and NumPy
- Scikit-learn
- Statsmodels
- Joblib

**Tools**
- Jupyter Notebook
- Visual Studio Code
- Git and GitHub
- Antigravity

## Project Structure

```text
project-root/
├── backend/              # FastAPI application and ML services
├── frontend/             # React + Vite application
├── data/
│   ├── raw/               # Original datasets
│   └── processed/         # Processed modelling datasets
├── Notebooks/             # Nine ML and analysis notebooks
├── models/                # Saved trained model artifacts
├── visualizations/        # Generated charts and plots
├── outputs/               # Evaluation results
├── documentation/         # Project documentation
├── README.md
└── .gitignore
```

## Installation & Local Setup

### Prerequisites

- Python 3.10 or a compatible version supported by the backend dependencies.
- Node.js and npm.
- Git.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

### 2. Set up the Python backend

```bash
python -m venv .venv
```

Activate the environment on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the backend from the project root:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

The API documentation should be available at:

```text
http://localhost:8000/docs
```

### 3. Set up the React frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the frontend folder:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local development URL printed by Vite, usually:

```text
http://localhost:5173
```

## Deployment

The frontend can be deployed on Vercel, while the FastAPI backend can be hosted on Render.

Configure the frontend environment variable with the deployed backend URL and configure backend CORS to allow requests from the deployed Vercel domain.

Refer to the deployment instructions in this repository's documentation or the respective platform documentation.

## Dataset Sources & Attribution

- [Our World in Data – CO₂ and Greenhouse Gas Emissions](https://ourworldindata.org/co2-and-greenhouse-gas-emissions)
- [Our World in Data – Energy](https://ourworldindata.org/energy)
- Global Carbon Budget and associated sources documented in the original dataset codebooks.

Dataset attribution and licensing should follow the terms specified by the respective original sources.

## Methodological Notes

- Model evaluation metrics correspond to specific validation and held-out test procedures; they should not be interpreted as guarantees of future prediction accuracy.
- Forecasts generated through recursive CO₂ lags are conditional projections, not unconditional forecasts with independently predicted future economic and energy indicators.
- Renewable-energy relationships are statistical associations and do not independently establish causation.

## Author

Developed as a final-year academic project for the Startup and Entrepreneurial Activity course, Semester VII.

**Project ID:** P_132