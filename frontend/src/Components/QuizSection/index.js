import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

// IMPORT CHART COMPONENTS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// REGISTER CHARTJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function QuizSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const examType = location.state?.examType || "JEE";

  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allResults, setAllResults] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  useEffect(() => {
    // Questions will be displayed based on Exam Type
    fetch("/api/start-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examType: examType.toLowerCase() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.questions);
        setLoading(false);
      })
      .catch((err) => console.error("Error:", err));
  }, [examType]);

  const currentQuiz = questions[currentStep];

  if (loading || !currentQuiz) {
    return (
      <div className="quiz-container">
        <div className="loader-box">
          <div className="spinner"></div>
          <h2>Preparing your {examType} Session...</h2>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (selectedOptionIndex === null) return alert("Please select an answer!");
    try {
      const response = await fetch("/api/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType: examType.toLowerCase(),
          answers: [
            { questionId: currentQuiz.id, selectedOption: selectedOptionIndex },
          ],
        }),
      });
      const data = await response.json();
      const resultData = data.result[0];
      setServerResult(resultData);
      setIsSubmitted(true);
      setAllResults((prev) => [
        ...prev,
        {
          ...resultData,
          subject: currentQuiz.subject,
          questionText: currentQuiz.question,
        },
      ]);
    } catch (err) {
      alert("Server error.");
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOptionIndex(null);
      setIsSubmitted(false);
      setServerResult(null);
    } else {
      setShowScoreboard(true);
    }
  };

  if (showScoreboard) {
    const correctCount = allResults.filter((r) => r.correct).length;
    const percentage = ((correctCount / questions.length) * 100).toFixed(0);

    // LOGIC FOR BAR CHART DATA
    const subjects = [...new Set(allResults.map((r) => r.subject))];
    const chartData = {
      labels: subjects,
      datasets: [
        {
          label: "Correct",
          data: subjects.map(
            (s) =>
              allResults.filter((r) => r.subject === s && r.correct).length,
          ),
          backgroundColor: "#22c55e",
        },
        {
          label: "Incorrect",
          data: subjects.map(
            (s) =>
              allResults.filter((r) => r.subject === s && !r.correct).length,
          ),
          backgroundColor: "#ef4444",
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, color: "#fff" } },
        x: { ticks: { color: "#fff" } },
      },
      plugins: { legend: { labels: { color: "#fff" } } },
    };

    const weakAreas = [
      ...new Set(allResults.filter((r) => !r.correct).map((r) => r.subject)),
    ];
    return (
      <div className="quiz-container">
        <div className="score-card animate-in full-width">
          <h1>Test Analysis: {examType}</h1>

          <div className="dashboard-grid">
            <div className="score-visual">
              <div className="progress-ring">
                <span className="percent-text">{percentage}%</span>
                <span className="sub-text">Accuracy</span>
              </div>
            </div>

            <div className="chart-section">
              <h3>Performance by Subject</h3>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="focus-areas">
            <h3>⚠️ Areas for Improvement</h3>
            <p>
              Based on your results, you should focus on:{" "}
              <strong>{weakAreas.join(", ") || "None! Great job!"}</strong>
            </p>
          </div>

          <div className="analysis-list">
            <h3>Incorrect Answers Review</h3>
            {allResults.filter((r) => !r.correct).length === 0 ? (
              <p>No mistakes! Perfect score.</p>
            ) : (
              allResults
                .filter((r) => !r.correct)
                .map((res, i) => (
                  <div key={i} className="result-row is-wrong">
                    <div className="error-detail">
                      <p>
                        <strong>Question:</strong> {res.questionText}
                      </p>
                      <p>
                        <strong>Subject:</strong> {res.subject}
                      </p>
                    </div>
                    <strong>✗</strong>
                  </div>
                ))
            )}
          </div>

          <button className="primary-btn" onClick={() => navigate("/")}>
            Return to Dashboard
          </button>

          <div className="action-row">
            <button
              className="primary-btn pulse-effect"
              onClick={() => navigate("/schedule", { state: { weakAreas } })}
            >
              Generate 7-Day Recovery Plan →
            </button>
            <button className="secondary-btn" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card animate-in">
        <div className="quiz-header">
          <span className="subject-tag">{currentQuiz.subject}</span>
          <div className="step-count">
            Question {currentStep + 1} of {questions.length}
          </div>
        </div>

        <h2 className="question-text">{currentQuiz.question}</h2>

        <div className="options-grid">
          {currentQuiz.options.map((option, index) => (
            <button
              key={index}
              disabled={isSubmitted}
              onClick={() => setSelectedOptionIndex(index)}
              className={`option-tile ${selectedOptionIndex === index ? "active" : ""} 
                ${isSubmitted && index === serverResult?.correctAnswer ? "correct-ans" : ""}
                ${isSubmitted && selectedOptionIndex === index && !serverResult?.correct ? "wrong-ans" : ""}`}
            >
              <span className="option-label">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {!isSubmitted ? (
          <button className="submit-btn" onClick={handleSubmit}>
            Confirm Answer
          </button>
        ) : (
          <div className="feedback-area">
            <div
              className={`status-msg ${serverResult?.correct ? "success" : "failure"}`}
            >
              {serverResult?.correct
                ? "Excellent! That's correct."
                : `Incorrect. The right answer was: ${currentQuiz.options[serverResult.correctAnswer]}`}
            </div>
            <button className="next-btn" onClick={handleNext}>
              {currentStep === questions.length - 1
                ? "Finish Analysis"
                : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
