// store/slices/recruitmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getRecruitments,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  updateRecruitmentStatus,
} from "../services/RecruitmentService";

// --- Async Thunks ---
// Fetch all recruitments
export const fetchRecruitments = createAsyncThunk(
  "recruitments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getRecruitments();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create recruitment
export const addRecruitment = createAsyncThunk(
  "recruitments/add",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createRecruitment(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update recruitment
export const editRecruitment = createAsyncThunk(
  "recruitments/edit",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updateRecruitment(id, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update recruitment status
export const updateStatus = createAsyncThunk(
  "recruitments/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await updateRecruitmentStatus(id, status);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete recruitment
export const removeRecruitment = createAsyncThunk(
  "recruitments/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteRecruitment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice ---
const recruitmentSlice = createSlice({
  name: "recruitments",
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
    // Fetch recruitments
    builder
      .addCase(fetchRecruitments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruitments.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecruitments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add recruitment
    builder
      .addCase(addRecruitment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecruitment.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.loading = false;
        state.success = "Job posting created successfully!";
      })
      .addCase(addRecruitment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Edit recruitment
    builder
      .addCase(editRecruitment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editRecruitment.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.loading = false;
        state.success = "Job posting updated successfully!";
      })
      .addCase(editRecruitment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update status
    builder
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.loading = false;
        state.success = "Status updated successfully!";
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove recruitment
    builder
      .addCase(removeRecruitment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeRecruitment.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload);
        state.loading = false;
        state.success = "Job posting deleted successfully!";
      })
      .addCase(removeRecruitment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = recruitmentSlice.actions;
export default recruitmentSlice.reducer;
