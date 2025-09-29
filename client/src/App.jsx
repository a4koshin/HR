import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./routes/PrivateRoute";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeePage from "./pages/EmployeePage";
import AttendancePage from "./pages/attendancePage";
import PayrollPage from "./pages/PayrollPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import TrainingPage from "./pages/TrainingPage";
import DocumentsPage from "./pages/DocumentsPage";
import DepartmentPage from "./pages/DepartmentPage";

const App = () => {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
