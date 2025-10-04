import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEmployeeEnums } from "../services/employeeService";

// Async thunk
export const fetchEmployeeEnums = createAsyncThunk(
  "employeeEnums/fetchEmployeeEnums",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEmployeeEnums();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const employeeEnumsSlice = createSlice({
  name: "employeeEnums",
  initialState: {
    enums: {
      contractType: [],
      shiftType: [],
      status: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeEnums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeEnums.fulfilled, (state, action) => {
        state.loading = false;
        state.enums = action.payload;
      })
      .addCase(fetchEmployeeEnums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default employeeEnumsSlice.reducer;
