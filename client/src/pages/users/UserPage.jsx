
// import React, { useState } from "react";
// import { TailSpin } from "react-loader-spinner";
// import { useAuth } from "../context/AuthProvider";
// import { useUpdateProfileMutation, useChangePasswordMutation } from "../store/auth/authApi";
// import { FiUser, FiMail, FiLock, FiSave, FiEdit2, FiShield, FiCheckCircle } from "react-icons/fi";

// const UserProfilePage = () => {
//   const { user, setName, setEmail } = useAuth();
//   const [activeTab, setActiveTab] = useState("profile");
//   const [isEditing, setIsEditing] = useState(false);

//   const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
//   const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

//   const [profileForm, setProfileForm] = useState({
//     name: user?.name || "",
//     email: user?.email || ""
//   });

//   const [passwordForm, setPasswordForm] = useState({
//     oldPassword: "",
//     newPassword: "",
//     confirmPassword: ""
//   });

//   const [message, setMessage] = useState({ type: "", text: "" });

//   const handleProfileChange = (e) => {
//     setProfileForm(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handlePasswordChange = (e) => {
//     setPasswordForm(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const result = await updateProfile(profileForm).unwrap();
//       if (result.success) {
//         setName(profileForm.name);
//         setEmail(profileForm.email);
//         setIsEditing(false);
//         setMessage({ type: "success", text: "Profile updated successfully!" });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: "error", 
//         text: error?.data?.message || "Failed to update profile" 
//       });
//     }
//   };

//   const handlePasswordChangeSubmit = async (e) => {
//     e.preventDefault();
    
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       setMessage({ type: "error", text: "New passwords do not match" });
//       return;
//     }

//     if (passwordForm.newPassword.length < 6) {
//       setMessage({ type: "error", text: "Password must be at least 6 characters long" });
//       return;
//     }

//     try {
//       const result = await changePassword({
//         oldPassword: passwordForm.oldPassword,
//         newPassword: passwordForm.newPassword
//       }).unwrap();

//       if (result.success) {
//         setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
//         setMessage({ type: "success", text: "Password changed successfully!" });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: "error", 
//         text: error?.data?.message || "Failed to change password" 
//       });
//     }
//   };

//   const clearMessage = () => {
//     setMessage({ type: "", text: "" });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
//       <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-10">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div className="mb-6 sm:mb-0">
//               <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 My Profile
//               </h1>
//               <p className="text-gray-600 mt-3 text-lg">
//                 Manage your account settings and preferences
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar Navigation */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <div className="flex items-center space-x-4 mb-6">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-xl">
//                   {user?.name?.charAt(0) || "U"}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
//                   <p className="text-gray-500 text-sm">{user?.email}</p>
//                 </div>
//               </div>

//               <nav className="space-y-2">
//                 <button
//                   onClick={() => setActiveTab("profile")}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
//                     activeTab === "profile" 
//                       ? "bg-blue-50 text-blue-700 border border-blue-200" 
//                       : "text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   <FiUser className="w-5 h-5" />
//                   <span className="font-medium">Profile Information</span>
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("password")}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
//                     activeTab === "password" 
//                       ? "bg-blue-50 text-blue-700 border border-blue-200" 
//                       : "text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   <FiLock className="w-5 h-5" />
//                   <span className="font-medium">Change Password</span>
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("security")}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
//                     activeTab === "security" 
//                       ? "bg-blue-50 text-blue-700 border border-blue-200" 
//                       : "text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   <FiShield className="w-5 h-5" />
//                   <span className="font-medium">Security</span>
//                 </button>
//               </nav>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             {/* Message Alert */}
//             {message.text && (
//               <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
//                 message.type === "success" 
//                   ? "bg-green-50 border border-green-200 text-green-700" 
//                   : "bg-red-50 border border-red-200 text-red-700"
//               }`}>
//                 {message.type === "success" ? (
//                   <FiCheckCircle className="w-5 h-5" />
//                 ) : (
//                   <div className="w-2 h-8 bg-red-500 rounded-full"></div>
//                 )}
//                 <div className="flex-1">
//                   <p className="font-medium">{message.text}</p>
//                 </div>
//                 <button
//                   onClick={clearMessage}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ×
//                 </button>
//               </div>
//             )}

//             {/* Profile Information Tab */}
//             {activeTab === "profile" && (
//               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
//                   {!isEditing && (
//                     <button
//                       onClick={() => setIsEditing(true)}
//                       className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
//                     >
//                       <FiEdit2 className="w-4 h-4" />
//                       Edit Profile
//                     </button>
//                   )}
//                 </div>

//                 <form onSubmit={handleProfileUpdate}>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <FiUser className="w-4 h-4 text-blue-600" />
//                         Full Name
//                       </label>
//                       <input
//                         type="text"
//                         name="name"
//                         value={profileForm.name}
//                         onChange={handleProfileChange}
//                         disabled={!isEditing}
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:text-gray-500"
//                         required
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <FiMail className="w-4 h-4 text-blue-600" />
//                         Email Address
//                       </label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={profileForm.email}
//                         onChange={handleProfileChange}
//                         disabled={!isEditing}
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:text-gray-500"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {isEditing && (
//                     <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setIsEditing(false);
//                           setProfileForm({ name: user?.name || "", email: user?.email || "" });
//                         }}
//                         className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition duration-200"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         disabled={isUpdatingProfile}
//                         className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
//                       >
//                         {isUpdatingProfile ? (
//                           <>
//                             <TailSpin height={20} width={20} color="#FFFFFF" />
//                             Updating...
//                           </>
//                         ) : (
//                           <>
//                             <FiSave className="w-5 h-5" />
//                             Save Changes
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   )}
//                 </form>
//               </div>
//             )}

//             {/* Change Password Tab */}
//             {activeTab === "password" && (
//               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

//                 <form onSubmit={handlePasswordChangeSubmit}>
//                   <div className="space-y-6">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <FiLock className="w-4 h-4 text-blue-600" />
//                         Current Password
//                       </label>
//                       <input
//                         type="password"
//                         name="oldPassword"
//                         value={passwordForm.oldPassword}
//                         onChange={handlePasswordChange}
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
//                         placeholder="Enter your current password"
//                         required
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <FiLock className="w-4 h-4 text-blue-600" />
//                         New Password
//                       </label>
//                       <input
//                         type="password"
//                         name="newPassword"
//                         value={passwordForm.newPassword}
//                         onChange={handlePasswordChange}
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
//                         placeholder="Enter your new password"
//                         required
//                       />
//                       <p className="text-xs text-gray-500">
//                         Password must be at least 6 characters long
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <FiLock className="w-4 h-4 text-blue-600" />
//                         Confirm New Password
//                       </label>
//                       <input
//                         type="password"
//                         name="confirmPassword"
//                         value={passwordForm.confirmPassword}
//                         onChange={handlePasswordChange}
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
//                         placeholder="Confirm your new password"
//                         required
//                       />
//                     </div>

//                     <div className="flex justify-end pt-4">
//                       <button
//                         type="submit"
//                         disabled={isChangingPassword}
//                         className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
//                       >
//                         {isChangingPassword ? (
//                           <>
//                             <TailSpin height={20} width={20} color="#FFFFFF" />
//                             Changing...
//                           </>
//                         ) : (
//                           <>
//                             <FiSave className="w-5 h-5" />
//                             Update Password
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {/* Security Tab */}
//             {activeTab === "security" && (
//               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <FiShield className="w-5 h-5 text-blue-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
//                         <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
//                       </div>
//                     </div>
//                     <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition duration-200">
//                       Enable
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-green-100 rounded-lg">
//                         <FiCheckCircle className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Login Activity</h3>
//                         <p className="text-sm text-gray-600">Review your recent login sessions</p>
//                       </div>
//                     </div>
//                     <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
//                       View Logs
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-purple-100 rounded-lg">
//                         <FiUser className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">Account Privacy</h3>
//                         <p className="text-sm text-gray-600">Manage your privacy settings</p>
//                       </div>
//                     </div>
//                     <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
//                       Configure
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfilePage;