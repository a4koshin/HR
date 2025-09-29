import React, { useState, useEffect } from 'react';
import {
  getEmployees,
  getDepartments,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService';
import axiosInstance from '../services/axiosInstance';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [enums, setEnums] = useState({ contractType: [], shiftType: [], status: [] });

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    hireDate: '',
    contractType: '',
    salary: '',
    shiftType: '',
    status: 'Active',
    document: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchEnums();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employeesData = await getEmployees();
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchEnums = async () => {
    try {
      const res = await axiosInstance.get('/api/enums/employee-enums');
      setEnums(res.data);
    } catch (err) {
      console.error('Error fetching enums:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee._id, formData);
        setEmployees(employees.map(emp => emp._id === updated._id ? updated : emp));
        setSuccess('Employee updated successfully!');
      } else {
        const created = await createEmployee(formData);
        setEmployees([...employees, created]);
        setSuccess('Employee created successfully!');
      }

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      fullname: employee.fullname,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      department: employee.department?._id || employee.department,
      position: employee.position,
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
      contractType: employee.contractType,
      salary: employee.salary,
      shiftType: employee.shiftType,
      status: employee.status,
      document: employee.document || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      setLoading(true);
      await deleteEmployee(id);
      setEmployees(employees.filter(emp => emp._id !== id));
      setSuccess('Employee deleted successfully!');
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: '',
      email: '',
      phone: '',
      address: '',
      department: '',
      position: '',
      hireDate: '',
      contractType: '',
      salary: '',
      shiftType: '',
      status: 'Active',
      document: ''
    });
    setEditingEmployee(null);
    setError('');
    setSuccess('');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-2">Manage your hospital staff efficiently</p>
          </div>
          <button
            onClick={openAddModal}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            {loading ? 'Loading...' : '+ Add New Employee'}
          </button>
        </div>

        {/* Notifications */}
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

        {/* Employees Table */}
        {loading && employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Loading employees...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.fullname}</div>
                          <div className="text-sm text-gray-500">{emp.email}</div>
                          <div className="text-sm text-gray-500">{emp.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-[.1rem] inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {emp.department?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${emp.salary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(emp)} disabled={loading} className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:text-gray-400">Edit</button>
                        <button onClick={() => handleDelete(emp._id)} disabled={loading} className="text-red-600 hover:text-red-900 disabled:text-gray-400">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && employees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first employee.</p>
            <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">Add Employee</button>
          </div>
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Personal Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Personal Information</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter address" />
                  </div>

                  {/* Employment Info */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Employment Information</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter position" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                    <select name="contractType" value={formData.contractType} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Contract Type</option>
                      {enums.contractType.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type *</label>
                    <select name="shiftType" value={formData.shiftType} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Shift Type</option>
                      {enums.shiftType.map(shift => <option key={shift} value={shift}>{shift}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                    <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
                    <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter salary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {enums.status.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>

                  {/* Document */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document (Optional)</label>
                    <input type="text" name="document" value={formData.document} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter document URL or path" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} disabled={loading} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium">
                    {loading ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
