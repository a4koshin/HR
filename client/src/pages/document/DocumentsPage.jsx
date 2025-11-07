import React from "react";
import { FileText } from "lucide-react";

const DocumentsPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6">
        <FileText className="mx-auto mb-4 text-gray-400" size={48} />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Documents Page</h2>
        <p className="text-gray-500">
          This is where document management features will be implemented.
        </p>
      </div>
    </div>
  );
};

export default DocumentsPage;
