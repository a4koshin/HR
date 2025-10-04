// store/slices/payrollSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "../services/payrollService";

// --- Async Thunks ---
// Fetch all payrolls
export const fetchPayrolls = createAsyncThunk(
  "payrolls/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getPayrolls();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create payroll
export const addPayroll = createAsyncThunk(
  "payrolls/add",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createPayroll(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update payroll
export const editPayroll = createAsyncThunk(
  "payrolls/edit",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updatePayroll(id, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete payroll
export const removePayroll = createAsyncThunk(
  "payrolls/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deletePayroll(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice ---
const payrollSlice = createSlice({
  name: "payrolls",
  initialState: {
    list: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch payrolls
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add payroll
    builder
      .addCase(addPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayroll.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.loading = false;
        state.success = "Payroll record created successfully!";
      })
      .addCase(addPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Edit payroll
    builder
      .addCase(editPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPayroll.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.loading = false;
        state.success = "Payroll record updated successfully!";
      })
      .addCase(editPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove payroll
    builder
      .addCase(removePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePayroll.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
        state.loading = false;
        state.success = "Payroll record deleted successfully!";
      })
      .addCase(removePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = payrollSlice.actions;
export default payrollSlice.reducer;
