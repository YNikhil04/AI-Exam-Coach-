import { BrowserRouter, Routes, Route } from "react-router-dom"; // Added Routes
import MainPage from "../MainPage";
import QuizSection from "../QuizSection";
import SchedulePlanner from "../SchedulePlanner";
import LoginPage from "../LoginPage";

export default function TotalWebsite() {
  return (
    <BrowserRouter>
      <Routes>
        {" "}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/quiz/" element={<QuizSection />} />
        <Route path="/schedule" element={<SchedulePlanner />} />
      </Routes>
    </BrowserRouter>
  );
}
