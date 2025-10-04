// store/slices/departmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService";

// Fetch all
export const fetchDepartments = createAsyncThunk(
  "departments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDepartments();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create
export const createDepartmentAsync = createAsyncThunk(
  "departments/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createDepartment(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update
export const updateDepartmentAsync = createAsyncThunk(
  "departments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await updateDepartment(id, data);
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete
export const deleteDepartmentAsync = createAsyncThunk(
  "departments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDepartment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    fetchLoading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
        state.fetchLoading = false;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createDepartmentAsync.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createDepartmentAsync.fulfilled, (state, action) => {
        state.departments.push(action.payload);
        state.actionLoading = false;
      })
      .addCase(createDepartmentAsync.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateDepartmentAsync.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateDepartmentAsync.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) state.departments[index] = action.payload;
        state.actionLoading = false;
      })
      .addCase(updateDepartmentAsync.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteDepartmentAsync.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteDepartmentAsync.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (d) => d._id !== action.payload
        );
        state.actionLoading = false;
      })
      .addCase(deleteDepartmentAsync.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export default departmentSlice.reducer;
