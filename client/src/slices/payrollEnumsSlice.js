import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPayrollEnums } from "../services/payrollService";

// --- Async Thunk ---
export const fetchPayrollEnums = createAsyncThunk(
  "payrollEnums/fetchPayrollEnums",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getPayrollEnums();
      return data; // expected format: { paidStatus: [], paymentMethod: [] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice ---
const payrollEnumsSlice = createSlice({
  name: "payrollEnums",
  initialState: {
    paidStatus: [],
    paymentMethod: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollEnums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollEnums.fulfilled, (state, action) => {
        state.loading = false;
        state.paidStatus = action.payload.paidStatus || [];
        state.paymentMethod = action.payload.paymentMethod || [];
      })
      .addCase(fetchPayrollEnums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default payrollEnumsSlice.reducer;
