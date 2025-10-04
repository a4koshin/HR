import React from "react";
import { TailSpin } from "react-loader-spinner";

export const LoadingSpinner = ({ size = 20, color = "#2563EB" }) => (
  <TailSpin height={size} width={size} color={color} ariaLabel="loading" />
);

export const LoadingButton = ({ loading, children, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`flex items-center justify-center gap-2 ${
      props.className || ""
    }`}
  >
    {loading && <LoadingSpinner size={20} />}
    {children}
  </button>
);

export const PageLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
    <LoadingSpinner size={80} />
  </div>
);

export const TableLoader = () => (
  <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
    <div className="flex justify-center mb-4">
      <LoadingSpinner size={40} />
    </div>
    Loading employees...
  </div>
);
