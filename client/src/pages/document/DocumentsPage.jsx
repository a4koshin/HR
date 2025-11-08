import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import DocumentModel from "./DocumentModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiFile,
  FiCalendar,
  FiUser,
  FiDownload,
} from "react-icons/fi";
import { HiDocumentDuplicate, HiStatusOnline } from "react-icons/hi";

const DocumentPage = () => {
  const {
    data: documentData = [],
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: "/documents" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [employeesMap, setEmployeesMap] = useState({});

  // Fetch employees to populate the map
  const { data: employeesData } = useGetallFunctionQuery({ url: "/employees" });

  useEffect(() => {
    if (employeesData?.employees) {
      const map = {};
      employeesData.employees.forEach(emp => {
        map[emp._id] = emp;
      });
      setEmployeesMap(map);
    }
  }, [employeesData]);

  const openAddModal = () => {
    setEditingDocument(null);
    setIsModalOpen(true);
  };

  const openEditModal = (document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
  };

  const handleDocumentSaved = () => {
    closeModal();
    refetch();
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        // You'll need to implement the delete mutation
        // await deleteDocument(documentId).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  const handleDownload = (documentFile) => {
    // Implement download logic
    window.open(documentFile, '_blank');
  };

  const getDocumentStatus = (expiryDate) => {
    if (!expiryDate) return { status: "Valid", color: "green" };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: "Expired", color: "red" };
    if (daysUntilExpiry <= 30) return { status: "Expiring Soon", color: "orange" };
    return { status: "Valid", color: "green" };
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'Medical License': 'blue',
      'Certification': 'purple',
      'Compliance Document': 'green'
    };
    return colors[type] || 'gray';
  };

  // Helper function to get employee data
  const getEmployeeData = (document) => {
    // If employeeId is populated (object with fullname and email)
    if (document.employeeId && typeof document.employeeId === 'object') {
      return {
        fullname: document.employeeId.fullname || "Unknown",
        email: document.employeeId.email || "No email"
      };
    }
    // If employeeId is just an ID string, look it up in the map
    else if (document.employeeId && employeesMap[document.employeeId]) {
      const emp = employeesMap[document.employeeId];
      return {
        fullname: emp.fullname || "Unknown",
        email: emp.email || "No email"
      };
    }
    // Fallback
    return {
      fullname: "Unknown",
      email: "No email"
    };
  };

  const documents = documentData?.documents || [];

  // Calculate statistics
  const totalDocuments = documents.length;
  const expiredDocuments = documents.filter(doc => 
    getDocumentStatus(doc.expiryDate).status === "Expired"
  ).length;
  const expiringSoonDocuments = documents.filter(doc => 
    getDocumentStatus(doc.expiryDate).status === "Expiring Soon"
  ).length;
  const validDocuments = documents.filter(doc => 
    getDocumentStatus(doc.expiryDate).status === "Valid"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Document Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage employee documents, certifications, and compliance records
              </p>
            </div>
            <button
              onClick={openAddModal}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-w-[180px]"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiPlus className="text-xl" />
                  <span>Add Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Documents
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalDocuments}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <HiDocumentDuplicate className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valid</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {validDocuments}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <HiStatusOnline className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {expiringSoonDocuments}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FiCalendar className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {expiredDocuments}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiFile className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading documents</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && documents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin
                height={50}
                width={50}
                color="#2563EB"
                ariaLabel="loading"
              />
            </div>
            <p className="text-gray-600 text-lg">Loading documents...</p>
          </div>
        ) : (
          // Documents Table
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Document Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => {
                    const status = getDocumentStatus(doc.expiryDate);
                    const typeColor = getDocumentTypeColor(doc.type);
                    const employeeData = getEmployeeData(doc);
                    
                    return (
                      <tr
                        key={doc._id}
                        className="hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 bg-gradient-to-br from-${typeColor}-500 to-${typeColor}-600 rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
                                <FiFile className="text-xl" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold text-gray-900 truncate">
                                {doc.documentName}
                              </p>
                              {doc.complianceCategory && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {doc.complianceCategory}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {employeeData.fullname}
                              </p>
                              <p className="text-sm text-gray-500">
                                {employeeData.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-${typeColor}-50 text-${typeColor}-700 border border-${typeColor}-200`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiCalendar className="w-4 h-4" />
                              Issued: {new Date(doc.issuedDate).toLocaleDateString()}
                            </div>
                            {doc.expiryDate && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiCalendar className="w-4 h-4" />
                                Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                              status.color === 'green'
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : status.color === 'orange'
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                status.color === 'green'
                                  ? "bg-green-500"
                                  : status.color === 'orange'
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDownload(doc.documentFile)}
                              className="p-2.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                              title="Download Document"
                            >
                              <FiDownload className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(doc)}
                              className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                              title="Edit Document"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc._id)}
                              className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                              title="Delete Document"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {documents.length === 0 && !isLoading && (
              <div className="bg-white text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <HiDocumentDuplicate className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by uploading your first document
                </p>
                <button
                  onClick={openAddModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
                >
                  Upload First Document
                </button>
              </div>
            )}
          </div>
        )}

        {/* Document Modal */}
        <DocumentModel
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleDocumentSaved}
          document={editingDocument}
        />
      </div>
    </div>
  );
};

export default DocumentPage;