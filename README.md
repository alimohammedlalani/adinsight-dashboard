AdInsight – Marketing Analytics Dashboard

AdInsight is a data analytics dashboard that analyzes global digital advertising performance across multiple platforms, industries, campaign types, and countries.
The project combines Python data analysis with a React dashboard to transform raw advertising data into meaningful insights.
The goal of the project is to demonstrate how marketing data can be analyzed and visualized to understand:

* Which platforms perform best
* Which industries generate the highest revenue
* Which campaigns convert the most
* Which countries have the highest return on ad spend

Live Demo:
https://adinsight-dashboard.vercel.app/

-----

# Project Overview

The project uses a real advertising dataset to analyze marketing performance across:

* Google Ads
* Meta Ads
* TikTok Ads

The dashboard highlights key performance indicators such as:

* Total Ad Spend
* Total Clicks
* Total Conversions
* Average Conversion Rate
* Return on Ad Spend (ROAS)

Interactive charts and heatmaps allow quick comparison between different marketing dimensions.

---

# Features

• Platform performance analysis
• Industry revenue comparison
• Campaign type conversion analysis
• Country-wise ROAS visualization
• Platform × Industry ROAS heatmap
• Interactive data visualizations

---

# Tech Stack

Frontend

* React
* TailwindCSS
* Recharts

Data Analysis

* Python
* Pandas
* NumPy
* Jupyter Notebook

Deployment

* Vercel

---

# Data Analysis Workflow

1. Load dataset using Pandas
2. Clean and inspect the data
3. Calculate key marketing metrics:

   * Conversion Rate
   * Cost Per Conversion
   * ROAS
4. Perform grouped analysis:

   * Platform performance
   * Industry performance
   * Campaign performance
   * Country performance
5. Export aggregated results to JSON
6. Use JSON data in the React dashboard

---

# Key Insights

Example insights derived from the dataset:

* TikTok Ads generated the highest number of conversions.
* SaaS industry generated the highest revenue.
* Search campaigns produced the best conversion rate.
* India had the highest ROAS among all countries.

---

# Project Structure

```
adinsight-dashboard
│
├── analysis.ipynb           # Data analysis in Python
│
├── Frontend
│   └── ad_insights
│        ├── src
│        │   ├── components
│        │   └── assets/data
│        ├── package.json
│        └── vite.config.js
│
└── README.md
```

---

# Dataset

Dataset used:

Global Ads Performance Dataset
Source: Kaggle

License: CC0 Public Domain

---

# How to Run Locally

Clone the repository

```
git clone https://github.com/alimohammedlalani/adinsight-dashboard.git
```

Install dependencies

```
cd Frontend/ad_insights
npm install
```

Run the development server

```
npm run dev
```

Build for production

```
npm run build
```

---

# Future Improvements

* Add filtering by date ranges
* Add platform comparison view
* Add downloadable reports
* Connect to live marketing APIs
* Add predictive marketing analytics

---

# Author

Ali Mohammed Lalani
