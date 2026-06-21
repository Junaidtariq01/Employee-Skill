# EquiWork: AI-Powered Workforce Intelligence

## 🚀 Overview
EquiWork is an enterprise-grade platform designed to align workforce capabilities with real-time market trends. Using AI scoring and data-driven insights, it bridge the gap between individual skills and global industry demands.

---

## 🛠️ The Pipeline & API Integration

The backend relies on two primary external APIs:

1. **Evaluation API (Score & Review)**
2. **Market Trends API**

### 1. Employee Registration (Onboarding)
- **Action**: Employees enter their basic info, skills, and experience to sign up.
- **Trigger**: A new profile is created in Supabase.
- **API Call**: The frontend calls the **Evaluation API**, sending the `employee ID`.
- **Result**: The API calculates the assessment and directly updates the employee's `score` and `review` in Supabase. The employee dashboard then fetches and displays this updated data.

### 2. Dashboards
- **Employee Portal**: Displays personal metrics, AI Score, AI Review, and assigned roadmaps.
- **HR Dashboard**: Provides an executive overview of all employees. Fetches data from the **Market Trends API** to display global market visualizations.

### 3. Market Trend Synchronization (Global Rescore)
- **HR Action**: HR clicks the "Generate Trends" button and enters a textual description of current industry priorities.
- **API Call**: The frontend calls the **Evaluation API**, passing the HR's `description` as an argument.
- **Result**: The API autonomously fetches all employees from the database, recalculates their scores based on the new description, and updates the database directly. The frontend simply re-fetches the data to show the updated dashboard.

---

## 📂 Database Schema (Supabase)

### `profiles`
The core table storing user information.
- `id`: Linked to Supabase Auth.
- `role`: 'employee', 'hr', or 'admin'.
- `score`: The primary AI-driven metric (1-100).
- `review`: AI-generated text review of the employee's market fit.
- `experience_years`, `skills`, `burnout_risk`, etc.

### `market_trends`
Stores industry data fetched via APIs.
- `metric_name`, `value`, `category`, `source_api`.

### `grade_history`
Tracks movements in employee grades over time for growth analysis.

### `upskilling_recommendations`
HR-assigned roadmaps and training paths.
- `roadmap_details`, `target_skills`, `status`.

---

## 🔒 Security (RLS)
- **Employees**: Can only view their own performance logs, grade history, and roadmaps.
- **HR/Admins**: Have broad access to analyze workforce data and manage roadmaps.
- **Public**: Basic profile info is viewable for internal collaboration.
