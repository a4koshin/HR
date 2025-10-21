import React from "react";
import { 
  FiUsers, 
  FiBriefcase, 
  FiDollarSign, 
  FiCalendar, 
  FiTrendingUp, 
  FiUserCheck,
  FiClock,
  FiActivity
} from "react-icons/fi";
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
  ResponsiveContainer 
} from 'recharts';

const DashboardPage = () => {
  // Mock data - replace with actual API data
  const dashboardData = {
    stats: {
      totalEmployees: 124,
      totalDepartments: 8,
      totalPayroll: 125400,
      activeAttendance: 89,
      onLeave: 12,
      pendingLeaves: 5
    },
    departmentDistribution: [
      { name: 'HR', employees: 15, color: '#8884d8' },
      { name: 'IT', employees: 28, color: '#82ca9d' },
      { name: 'Finance', employees: 12, color: '#ffc658' },
      { name: 'Marketing', employees: 18, color: '#ff8042' },
      { name: 'Operations', employees: 22, color: '#0088fe' },
      { name: 'Sales', employees: 25, color: '#00C49F' },
      { name: 'R&D', employees: 8, color: '#FFBB28' }
    ],
    payrollTrend: [
      { month: 'Jan', payroll: 120000 },
      { month: 'Feb', payroll: 118000 },
      { month: 'Mar', payroll: 122000 },
      { month: 'Apr', payroll: 125000 },
      { month: 'May', payroll: 124500 },
      { month: 'Jun', payroll: 125400 }
    ],
    attendanceData: [
      { day: 'Mon', present: 118, absent: 6 },
      { day: 'Tue', present: 120, absent: 4 },
      { day: 'Wed', present: 115, absent: 9 },
      { day: 'Thu', present: 122, absent: 2 },
      { day: 'Fri', present: 119, absent: 5 },
      { day: 'Sat', present: 45, absent: 79 }
    ],
    leaveDistribution: [
      { type: 'Sick Leave', count: 8, color: '#FF6B6B' },
      { type: 'Vacation', count: 15, color: '#4ECDC4' },
      { type: 'Personal', count: 5, color: '#45B7D1' },
      { type: 'Maternity', count: 2, color: '#FFA07A' }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
                Overview of your organization's human resources metrics
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiActivity className="w-4 h-4 text-green-500" />
              <span>Last updated: Today, 10:30 AM</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Employees */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.totalEmployees}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+5% this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.stats.totalDepartments}
                </p>
                <p className="text-sm text-gray-500 mt-2">Across organization</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiBriefcase className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          {/* Monthly Payroll */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(dashboardData.stats.totalPayroll)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+3.2% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiDollarSign className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          {/* Attendance & Leaves */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Status</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{dashboardData.stats.activeAttendance}</p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-red-600">{dashboardData.stats.onLeave}</p>
                    <p className="text-xs text-gray-500">On Leave</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FiUserCheck className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
              <FiBriefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="employees"
                  >
                    {dashboardData.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payroll Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payroll Trend (Last 6 Months)</h3>
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.payrollTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Payroll']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="payroll" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Attendance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
              <FiClock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#3B82F6" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave Distribution</h3>
              <FiCalendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={dashboardData.leaveDistribution}
                  layout="vertical"
                  margin={{ left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="type" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                  >
                    {dashboardData.leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Stats & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <FiUsers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">89%</p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <FiDollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-sm text-gray-600">Payroll Accuracy</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <FiBriefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Open Positions</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <FiUserCheck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">New Hires</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New employee onboarded', time: '2 hours ago', type: 'success' },
                { action: 'Payroll processed for June', time: '5 hours ago', type: 'info' },
                { action: 'Leave request approved', time: '1 day ago', type: 'success' },
                { action: 'Department meeting scheduled', time: '1 day ago', type: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition duration-200">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;