import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteTraining,
  updateTraining,
  createTraining,
  getTrainings,
} from "../services/trainingServices";

// Async thunks
export const fetchTrainings = createAsyncThunk(
  "training/fetchTrainings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTrainings();
      return response.trainings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTrainingAsync = createAsyncThunk(
  "training/createTraining",
  async (trainingData, { rejectWithValue }) => {
    try {
      const response = await createTraining(trainingData);
      return response.training;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTrainingAsync = createAsyncThunk(
  "training/updateTraining",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateTraining(id, data);
      return response.training;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTrainingAsync = createAsyncThunk(
  "training/deleteTraining",
  async (id, { rejectWithValue }) => {
    try {
      await deleteTraining(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const trainingSlice = createSlice({
  name: "training",
  initialState: {
    trainings: [],
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
      // Fetch trainings
      .addCase(fetchTrainings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainings.fulfilled, (state, action) => {
        state.loading = false;
        state.trainings = action.payload;
      })
      .addCase(fetchTrainings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create training
      .addCase(createTrainingAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrainingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.trainings.push(action.payload);
        state.success = "Training created successfully!";
      })
      .addCase(createTrainingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update training
      .addCase(updateTrainingAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrainingAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trainings.findIndex(
          (training) => training._id === action.payload._id
        );
        if (index !== -1) {
          state.trainings[index] = action.payload;
        }
        state.success = "Training updated successfully!";
      })
      .addCase(updateTrainingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete training
      .addCase(deleteTrainingAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrainingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.trainings = state.trainings.filter(
          (training) => training._id !== action.payload
        );
        state.success = "Training deleted successfully!";
      })
      .addCase(deleteTrainingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = trainingSlice.actions;
export default trainingSlice.reducer;
