import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as leaveService from "../services/leaveService";

// Async thunks
export const fetchLeaves = createAsyncThunk(
  "leave/fetchLeaves",
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaveService.getLeaves();
      return response.leaves;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createLeaveAsync = createAsyncThunk(
  "leave/createLeave",
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await leaveService.createLeave(leaveData);
      return response.leave;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLeaveStatusAsync = createAsyncThunk(
  "leave/updateLeaveStatus",
  async ({ id, status, approvedBy }, { rejectWithValue }) => {
    try {
      const response = await leaveService.updateLeaveStatus(id, {
        status,
        approvedBy,
      });
      return response.leave;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLeaveAsync = createAsyncThunk(
  "leave/deleteLeave",
  async (id, { rejectWithValue }) => {
    try {
      await leaveService.deleteLeave(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const leaveSlice = createSlice({
  name: "leave",
  initialState: {
    leaves: [],
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
    builder
      // Fetch leaves
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create leave
      .addCase(createLeaveAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeaveAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.push(action.payload);
        state.success = "Leave application submitted successfully!";
      })
      .addCase(createLeaveAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update leave status
      .addCase(updateLeaveStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaves.findIndex(
          (leave) => leave._id === action.payload._id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        state.success = "Leave status updated successfully!";
      })
      .addCase(updateLeaveStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete leave
      .addCase(deleteLeaveAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeaveAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = state.leaves.filter(
          (leave) => leave._id !== action.payload
        );
        state.success = "Leave application deleted successfully!";
      })
      .addCase(deleteLeaveAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = leaveSlice.actions;
export default leaveSlice.reducer;
