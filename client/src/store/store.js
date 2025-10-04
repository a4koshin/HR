import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "../slices/employeeSlice";
import employeeEnumsReducer from "../slices/employeeEnumsSlice";
import departmentReducer from "../slices/departmentSlice";
import attendanceReducer from "../slices/attendanceSlice";
import payrollReducer from "../slices/payrollSlice";
import shiftReducer from "../slices/shiftSlice";
import recruitmentReducer from "../slices/recruitmentSlice";
import trainingReducer from "../slices/recruitmentSlice";
import leaveReducer from "../slices/leaveSlice";

export const store = configureStore({
  reducer: {
    employee: employeeReducer,
    employeeEnums: employeeEnumsReducer,
    department: departmentReducer,
    attendance: attendanceReducer,
    payrolls: payrollReducer,
    shifts: shiftReducer,
    recruitments: recruitmentReducer,
    training: trainingReducer,
    leave: leaveReducer,
  },
});
