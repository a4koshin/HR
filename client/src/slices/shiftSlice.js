// redux/slices/shiftSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  getShiftById,
} from "../services/shiftService";

// Async thunks
export const fetchShifts = createAsyncThunk(
  "shifts/fetchShifts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getShifts();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shifts"
      );
    }
  }
);

export const fetchShiftById = createAsyncThunk(
  "shifts/fetchShiftById",
  async (shiftId, { rejectWithValue }) => {
    try {
      const data = await getShiftById(shiftId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shift"
      );
    }
  }
);

export const addShift = createAsyncThunk(
  "shifts/addShift",
  async (shiftData, { rejectWithValue }) => {
    try {
      const data = await createShift(shiftData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create shift"
      );
    }
  }
);

export const editShift = createAsyncThunk(
  "shifts/editShift",
  async ({ id, shiftData }, { rejectWithValue }) => {
    try {
      const data = await updateShift(id, shiftData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update shift"
      );
    }
  }
);

export const removeShift = createAsyncThunk(
  "shifts/removeShift",
  async (shiftId, { rejectWithValue }) => {
    try {
      await deleteShift(shiftId);
      return shiftId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete shift"
      );
    }
  }
);

export const fetchShiftReport = createAsyncThunk(
  "shifts/fetchShiftReport",
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const data = await getShiftAttendanceReport(id, params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shift report"
      );
    }
  }
);

const shiftSlice = createSlice({
  name: "shifts",
  initialState: {
    shifts: [],
    currentShift: null,
    report: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentShift: (state) => {
      state.currentShift = null;
    },
    clearReport: (state) => {
      state.report = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all shifts
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = action.payload;
        state.success = true;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch shift by ID
      .addCase(fetchShiftById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShiftById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload;
      })
      .addCase(fetchShiftById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add shift
      .addCase(addShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShift.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts.push(action.payload);
        state.success = true;
      })
      .addCase(addShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit shift
      .addCase(editShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editShift.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shifts.findIndex(
          (shift) => shift._id === action.payload._id
        );
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(editShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete shift
      .addCase(removeShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeShift.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = state.shifts.filter(
          (shift) => shift._id !== action.payload
        );
        state.success = true;
      })
      .addCase(removeShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch report
      .addCase(fetchShiftReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShiftReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchShiftReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentShift, clearReport } =
  shiftSlice.actions;
export default shiftSlice.reducer;
