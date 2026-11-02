import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Essential for rendering tables
import Cookies from "js-cookie";
import "./index.css";

export default function SchedulePlanner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Local demo fallback if API fails
  const generateDemoPlan = useCallback((subjects) => {
    const subs = subjects.length > 0 ? subjects : ["Core Concepts"];
    let table = `| Day | Topic | Learning Activity | Goal |\n|---|---|---|---|\n`;
    const activities = [
      "Concept Mapping",
      "Solving PYQs",
      "Formula Revision",
      "Deep Theory Dive",
      "Timed Practice",
      "Peer Discussion",
      "Mock Exam",
    ];

    for (let i = 1; i <= 7; i++) {
      const subject = subs[(i - 1) % subs.length];
      table += `| Day ${i} | ${subject} | ${activities[i - 1]} | Master Basics |\n`;
    }
    return `### 💡 Study Roadmap (Demo Mode)\n\n${table}`;
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Fix: Safely extract the data passed from the quiz component scoreboard state
        const targetSubjects = state?.weakAreas || ["General Revision"];
        const energyLevel = "High";
        const dailyHours = 6;

        const response = await fetch("http://localhost:5000/api/optimize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("jwt_token")}`,
          },
          body: JSON.stringify({
            subjects: targetSubjects, // Mapping variables correctly to backend names
            energy: energyLevel,
            hours: dailyHours,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setPlan(data.text);
          setIsDemo(false); // Ensure demo is false on explicit success
        } else {
          throw new Error("API Error");
        }
      } catch (err) {
        console.warn("Switching to Demo Mode due to error:", err);
        setPlan(generateDemoPlan(state?.weakAreas || []));
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [state, generateDemoPlan]);

  return (
    <div className="quiz-container">
      <div className="score-card animate-in full-width">
        <header className="schedule-header">
          <h1>7-Day Recovery Plan {isDemo && "(Demo)"}</h1>
          <p>
            Targeting:{" "}
            <strong>{state?.weakAreas?.join(", ") || "All Topics"}</strong>
          </p>
        </header>

        {loading ? (
          <div className="loader-box">
            <div className="spinner"></div>
            <p>Generating with Gemini AI...</p>
          </div>
        ) : (
          <div className="markdown-table-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
          </div>
        )}

        <button className="primary-btn" onClick={() => navigate("/")}>
          Finish
        </button>
      </div>
    </div>
  );
}
