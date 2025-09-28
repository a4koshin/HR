// Calculate payroll totals
export const calculatePayroll = ({
    basicSalary,
    overtimeHours = 0,
    overtimeRate = 0,
    deduction = 0,
  }) => {
    const overtimePay = overtimeHours * overtimeRate;
    const grossPay = basicSalary + overtimePay;
    const netPay = grossPay - deduction;
  
    return { overtimePay, grossPay, netPay };
  };
  