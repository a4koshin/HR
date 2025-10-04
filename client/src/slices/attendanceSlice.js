import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceEnums,
} from "../services/attendanceService";
import { getEmployees } from "../services/employeeService";
import { getShifts } from "../services/shiftService";

// --- Thunks ---
export const fetchAttendances = createAsyncThunk(
  "attendance/fetchAttendances",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAttendances();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchEmployees = createAsyncThunk(
  "attendance/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEmployees();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchShifts = createAsyncThunk(
  "attendance/fetchShifts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getShifts();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchEnums = createAsyncThunk(
  "attendance/fetchEnums",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAttendanceEnums();
      return { status: Array.isArray(data?.status) ? data.status : [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addAttendance = createAsyncThunk(
  "attendance/addAttendance",
  async (attendance, { rejectWithValue }) => {
    try {
      const res = await createAttendance(attendance);
      return res.data; // return the created attendance object directly
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const editAttendance = createAsyncThunk(
  "attendance/editAttendance",
  async ({ id, attendance }, { rejectWithValue }) => {
    try {
      const res = await updateAttendance(id, attendance);
      return res.data; // return the updated attendance object directly
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeAttendance = createAsyncThunk(
  "attendance/removeAttendance",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAttendance(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice ---
const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendances: [],
    employees: [],
    shifts: [],
    enums: { status: [] },
    loading: false,
    error: "",
    success: "",
  },
  reducers: {
    clearMessages: (state) => {
      state.error = "";
      state.success = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Attendances
      .addCase(fetchAttendances.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Employees
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
      })

      // Fetch Shifts
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.shifts = action.payload;
      })

      // Fetch Enums
      .addCase(fetchEnums.fulfilled, (state, action) => {
        state.enums = action.payload;
      })

      // Add Attendance
      .addCase(addAttendance.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(addAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances.push(action.payload); // add new record immediately
        state.success = "Attendance record added successfully!";
      })
      .addCase(addAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Attendance
      .addCase(editAttendance.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(editAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendances.findIndex(
          (att) => att._id === action.payload._id
        );
        if (index !== -1) state.attendances[index] = action.payload; // update immediately
        state.success = "Attendance record updated successfully!";
      })
      .addCase(editAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Attendance
      .addCase(removeAttendance.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(removeAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = state.attendances.filter(
          (att) => att._id !== action.payload
        );
        state.success = "Attendance record deleted successfully!";
      })
      .addCase(removeAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = attendanceSlice.actions;
export default attendanceSlice.reducer;
