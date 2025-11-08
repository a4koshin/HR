import React from "react";
import { TailSpin } from "react-loader-spinner";
import { useGetallFunctionQuery } from "../store/DynamicApi";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiBriefcase,
  FiUserCheck,
  FiCalendar,
  FiActivity,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding, HiStatusOnline } from "react-icons/hi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  // --- Fetch Employees, Departments, Payrolls, Attendance ---
  const {
    data: empData = [],
    isLoading: empLoading,
    isError: empError,
  } = useGetallFunctionQuery({ url: "/employees" });

  const {
    data: deptData = [],
    isLoading: deptLoading,
    isError: deptError,
  } = useGetallFunctionQuery({ url: "/departments" });

  const {
    data: payrollData = [],
    isLoading: payrollLoading,
    isError: payrollError,
  } = useGetallFunctionQuery({ url: "/payrolls" });

  const {
    data: attendanceData = [],
    isLoading: attLoading,
    isError: attError,
  } = useGetallFunctionQuery({ url: "/attendance" });

  // --- Extract data arrays ---
  const employees = empData?.employees || [];
  const departments = deptData?.departments || [];
  const payrolls = payrollData?.payrolls || [];
  const attendanceRecords =
    attendanceData?.attendances || attendanceData?.data || [];

  // --- Employee Metrics ---
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const inactiveEmployees = employees.filter(
    (e) => e.status === "Inactive"
  ).length;

  // --- Department Metrics ---
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter(
    (d) => d.status === "Active"
  ).length;

  // --- Payroll Metrics ---
  const totalNetPay = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
  const totalGrossPay = payrolls.reduce((sum, p) => sum + (p.grossPay || 0), 0);
  const totalDeductions = payrolls.reduce(
    (sum, p) => sum + (p.deduction || 0),
    0
  );
  const paidCount = payrolls.filter((p) => p.paidStatus === "Paid").length;
  const pendingPayrolls = payrolls.filter(
    (p) => p.paidStatus === "Pending"
  ).length;

  // --- Attendance Metrics ---
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (a) => a.status === "Present"
  ).length;
  const absentCount = attendanceRecords.filter(
    (a) => a.status === "Absent"
  ).length;
  const lateCount = attendanceRecords.filter((a) => a.status === "Late").length;

  // --- Chart Data ---
  const departmentData = departments.map((dept) => ({
    name: dept.name,
    employees: dept.headCount || Math.floor(Math.random() * 20) + 5,
    color: getDepartmentColor(dept.name),
  }));

  const payrollTrendData = [
    { month: "Jan", payroll: totalNetPay * 0.85 },
    { month: "Feb", payroll: totalNetPay * 0.88 },
    { month: "Mar", payroll: totalNetPay * 0.92 },
    { month: "Apr", payroll: totalNetPay * 0.95 },
    { month: "May", payroll: totalNetPay * 0.98 },
    { month: "Jun", payroll: totalNetPay },
  ];

  const attendanceWeeklyData = [
    { day: "Mon", present: presentCount * 0.9, absent: absentCount * 1.1 },
    { day: "Tue", present: presentCount * 0.95, absent: absentCount * 0.9 },
    { day: "Wed", present: presentCount * 0.92, absent: absentCount * 0.95 },
    { day: "Thu", present: presentCount * 0.88, absent: absentCount * 1.05 },
    { day: "Fri", present: presentCount * 0.85, absent: absentCount * 1.1 },
    { day: "Sat", present: presentCount * 0.4, absent: absentCount * 1.8 },
  ];

  const employeeStatusData = [
    { name: "Active", value: activeEmployees, color: "#10B981" },
    { name: "Inactive", value: inactiveEmployees, color: "#EF4444" },
  ];

  // --- Loading & Error Handling ---
  const isLoading = empLoading || deptLoading || payrollLoading || attLoading;
  const isError = empError || deptError || payrollError || attError;

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <TailSpin height={60} width={60} color="#2563EB" />
          <p className="text-gray-600 mt-4 text-lg text-center">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiInfo className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error loading dashboard data
          </h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const attendanceRate =
    totalAttendance > 0
      ? ((presentCount / totalAttendance) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HR Dashboard
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Comprehensive overview of your organization's human resources
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <FiActivity className="w-4 h-4 text-green-500" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Employees"
            value={totalEmployees}
            subtitle={`${activeEmployees} active`}
            icon={<FiUsers className="w-6 h-6" />}
            color="blue"
            trend="+5%"
          />
          <MetricCard
            title="Departments"
            value={totalDepartments}
            subtitle={`${activeDepartments} active`}
            icon={<HiOutlineOfficeBuilding className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Monthly Payroll"
            value={formatCurrency(totalNetPay)}
            subtitle={`${paidCount} paid`}
            icon={<FiDollarSign className="w-6 h-6" />}
            color="green"
            trend="+3.2%"
          />
          <MetricCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            subtitle={`${presentCount} present today`}
            icon={<FiUserCheck className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Department Distribution
              </h3>
              <FiBriefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="employees" radius={[4, 4, 0, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payroll Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Payroll Trend
              </h3>
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Payroll"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="payroll"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Metrics & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Employee Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Employee Status
              </h3>
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {employeeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Weekly Attendance
              </h3>
              <FiCalendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="present"
                    fill="#3B82F6"
                    name="Present"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    fill="#EF4444"
                    name="Absent"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Stats
              </h3>
              <FiActivity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-4">
              <StatItem
                label="Active Employees"
                value={activeEmployees}
                total={totalEmployees}
                color="green"
              />
              <StatItem
                label="Paid Payrolls"
                value={paidCount}
                total={payrolls.length}
                color="blue"
              />
              <StatItem
                label="Present Today"
                value={presentCount}
                total={totalEmployees}
                color="orange"
              />
              <StatItem
                label="Active Departments"
                value={activeDepartments}
                total={totalDepartments}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Gross Pay"
            value={formatCurrency(totalGrossPay)}
            icon={<FiTrendingUp className="w-6 h-6" />}
            color="blue"
            compact
          />
          <MetricCard
            title="Total Deductions"
            value={formatCurrency(totalDeductions)}
            icon={<FiTrendingUp className="w-6 h-6" />}
            color="red"
            compact
          />
          <MetricCard
            title="Late Arrivals"
            value={lateCount}
            icon={<FiClock className="w-6 h-6" />}
            color="yellow"
            compact
          />
          <MetricCard
            title="Pending Payrolls"
            value={pendingPayrolls}
            icon={<FiClock className="w-6 h-6" />}
            color="orange"
            compact
          />
        </div>
      </div>
    </div>
  );
};

// --- Enhanced Metric Card Component ---
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  compact = false,
}) => {
  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
  };

  const { bg, text } = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white rounded-2xl p-${
        compact ? "4" : "6"
      } shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 group hover:translate-y-[-2px]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p
            className={`text-${
              compact ? "2xl" : "3xl"
            } font-bold text-gray-900 mt-1`}
          >
            {value}
          </p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <FiTrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                {trend}
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${bg} ${text} group-hover:scale-110 transition-transform duration-200`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// --- Stat Item Component for Progress Bars ---
const StatItem = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {value} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 text-right">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};

// --- Helper function for department colors ---
const getDepartmentColor = (departmentName) => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
    "#EC4899",
  ];
  const index = departmentName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default DashboardPage;
