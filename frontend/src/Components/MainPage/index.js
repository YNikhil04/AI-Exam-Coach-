import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./index.css";

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
];

export default function MainPage() {
  const navigate = useNavigate();
  const token = Cookies.get("jwt_token");

  useEffect(() => {
    if (token === undefined) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [currentQuote, setCurrentQuote] = useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [selectedExam, setSelectedExam] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const onClickTakeQuiz = (e) => {
    e.preventDefault();
    navigate("/quiz/", { state: { examType: selectedExam || "JEE" } });
  };

  const handleExamSelection = (exam) => {
    setSelectedExam(exam);
    setShowPopup(false);
    console.log("User selected:", exam);
  };

  // NEW: HANDLER FOR LOGOUT ACTION
  const handleLogout = () => {
    Cookies.remove("jwt_token"); // Delete the authentication cookie
    navigate("/login"); // Force redirection to login view
  };

  return (
    <>
      {/* EXAM SELECTION POPUP */}
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select Your Target Exam</h2>
            <p>Choose your path to get personalized coaching</p>
            <div className="exam-options">
              <button
                className="exam-card-btn"
                onClick={() => handleExamSelection("JEE")}
              >
                <div className="exam-icon">📐</div>
                <span>JEE</span>
              </button>
              <button
                className="exam-card-btn"
                onClick={() => handleExamSelection("GATE")}
              >
                <div className="exam-icon">⚙️</div>
                <span>GATE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT CONTAINER */}
      <div className={`main-container ${showPopup ? "blur-background" : ""}`}>
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="logo">
            ExamCoach<span>AI</span>
          </div>
          <div className="auth-buttons">
            {/* UPDATED: Only a functional Logout button shows up now */}
            <button className="btn-logout" onClick={handleLogout}>
              Logout 🏃‍♂️
            </button>
          </div>
        </nav>

        {/* Hero Section & Carousel */}
        <header className="hero-section">
          <div className="carousel-container">
            <p className="quote-text">"{quotes[currentQuote]}"</p>
          </div>
          <h1>Master Your {selectedExam || "Future"}</h1>
          <p className="subtitle">
            Analyze your errors, bridge your gaps, and ace your entrance exams.
          </p>
          <button className="take-quiz-btn" onClick={onClickTakeQuiz}>
            Take Quiz Now
          </button>
        </header>

        {/* Resources Section */}
        <section className="resources-section">
          <div className="section-header">
            <h2>Learning Resources</h2>
            <p>
              Handpicked syllabus and study materials for{" "}
              {selectedExam || "your exam"}.
            </p>
          </div>

          <div className="resource-grid">
            <div className="resource-card">
              <h3>Mathematics</h3>
              <p>Calculus, Algebra, and Geometry deep dives.</p>
              <button className="view-btn">View Syllabus</button>
            </div>
            <div className="resource-card">
              <h3>Physics</h3>
              <p>Mechanics, Optics, and Thermodynamics modules.</p>
              <button className="view-btn">View Syllabus</button>
            </div>
            <div className="resource-card">
              <h3>Chemistry</h3>
              <p>Organic, Inorganic, and Physical Chemistry notes.</p>
              <button className="view-btn">View Syllabus</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
