import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./routes/PrivateRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import EmployeePage from "./pages/employee/EmployeePage";
import AttendancePage from "./pages/attendance/attendancePage";
import PayrollPage from "./pages/payroll/PayrollPage";
import RecruitmentPage from "./pages/Recruitment/RecruitmentPage";
import TrainingPage from "./pages/training/TrainingPage";
import DocumentsPage from "./pages/document/DocumentsPage";
import DepartmentPage from "./pages/department/DepartmentPage";
import ShiftsPage from "./pages/shift/ShiftsPage";
import LeavePage from "./pages/leave/LeavePage";
import UserPage from "./pages/users/UserPage";
import ApplicantPage from "./pages/applicant/ApplicantPage";

const App = () => {
  return (
    <div className="bg-blue-500">
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public routes */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/applicants" element={<ApplicantPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/users" element={<UserPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
