import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { useGetUsersQuery, useRegisterUserMutation, useUpdateUserMutation, useUpdateAppUserPasswordMutation } from "../../store/auth/authApi";
import { FiEdit2, FiTrash2, FiPlus, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUsers, FiUserCheck, FiUserPlus, FiShield } from "react-icons/fi";

const UserPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data: usersData, isLoading, isError, refetch } = useGetUsersQuery();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdateAppUserPasswordMutation();

  const users = usersData?.users || usersData || [];

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.length; // Assuming all users are active for now

  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const handleOpenProfileModal = (user = null) => {
    setEditingUser(user);
    setIsProfileModalOpen(true);
  };

  const handleOpenPasswordModal = (user = null) => {
    setEditingUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsRegisterModalOpen(false);
    setIsProfileModalOpen(false);
    setIsPasswordModalOpen(false);
    setEditingUser(null);
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load users</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage system users, permissions, and access controls
              </p>
            </div>
            <button
              onClick={handleOpenRegisterModal}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-w-[180px]"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiUserPlus className="text-xl" />
                  <span>Add User</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeUsers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiUserCheck className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <TailSpin height={50} width={50} color="#2563EB" ariaLabel="loading" />
              </div>
              <p className="text-gray-600 text-lg">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              {user.name?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              User ID: {user._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-900">
                          <FiMail className="w-4 h-4 text-blue-600" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenProfileModal(user)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Profile"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenPasswordModal(user)}
                            className="p-2.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Change Password"
                          >
                            <FiLock className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => console.log("Delete user", user._id)}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete User"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {users.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiUsers className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first user</p>
              <button
                onClick={handleOpenRegisterModal}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
              >
                <FiUserPlus className="text-lg" />
                Add First User
              </button>
            </div>
          )}
        </div>

        {/* Register Modal */}
        {isRegisterModalOpen && (
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={handleCloseModals}
            onSave={() => {
              refetch();
              handleCloseModals();
            }}
            isLoading={isRegistering}
          />
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={handleCloseModals}
            user={editingUser}
            onSave={() => {
              refetch();
              handleCloseModals();
            }}
            isLoading={isUpdating}
          />
        )}

        {/* Password Modal */}
        {isPasswordModalOpen && (
          <PasswordModal
            isOpen={isPasswordModalOpen}
            onClose={handleCloseModals}
            user={editingUser}
            onSave={() => {
              refetch();
              handleCloseModals();
            }}
            isLoading={isUpdatingPassword}
          />
        )}
      </div>
    </div>
  );
};

// Register Modal Component
const RegisterModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerUser] = useRegisterUserMutation();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await registerUser({
        formData: {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
      }).unwrap();
      
      onSave();
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error?.data?.message || "Failed to register user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FiUserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Register New User</h2>
                <p className="text-blue-100 text-sm">Add a new user to the system</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-xl">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-blue-600" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-blue-600" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiLock className="w-4 h-4 text-blue-600" />
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-blue-600" />
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition duration-200"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiUserPlus className="w-5 h-5" />
                  Register User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ isOpen, onClose, user, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        id: user._id,
        formData
      }).unwrap();
      
      onSave();
    } catch (error) {
      console.error("Update failed:", error);
      alert(error?.data?.message || "Failed to update profile");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Update Profile</h2>
                <p className="text-blue-100 text-sm">Update user information</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-xl">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-blue-600" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-blue-600" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition duration-200"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiEdit2 className="w-5 h-5" />
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Password Modal Component
const PasswordModal = ({ isOpen, onClose, user, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [updatePassword] = useUpdateAppUserPasswordMutation();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      await updatePassword({
        id: user._id,
        formData: {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        }
      }).unwrap();
      
      onSave();
    } catch (error) {
      console.error("Password change failed:", error);
      alert(error?.data?.message || "Failed to change password");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FiLock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Change Password</h2>
                <p className="text-blue-100 text-sm">Update user password</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-xl">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiLock className="w-4 h-4 text-blue-600" />
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("old")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.old ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-blue-600" />
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-blue-600" />
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 font-semibold transition duration-200"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiLock className="w-5 h-5" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add missing FiX import
const FiX = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default UserPage;