// Calculate leave duration in days (inclusive)
export const calculateLeaveDuration = (startDate, endDate) => {
    const diffTime = new Date(endDate) - new Date(startDate);
    if (diffTime < 0) return 0; // invalid date range
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };
  