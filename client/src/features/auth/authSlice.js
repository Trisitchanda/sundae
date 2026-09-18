import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data.data;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        return rejectWithValue(error.response.data);
      }
      // If it's a 500 error or network error, we don't reject the whole auth state,
      // but we throw so the component can handle it if needed.
      // Actually, returning rejectWithValue with a special flag might be better,
      // but since we don't want to clear the user, we should NOT dispatch a rejected action that clears user.
      throw error;
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', { email, password });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  user: null,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUser
      .addCase(fetchUser.pending, (state) => {
        // We only set isLoading to true if there is no user, so we don't flicker the UI if re-fetching
        if (!state.user) {
          state.isLoading = true;
        }
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        // Only clear user if the backend explicitly said Unauthorized
        if (action.payload) {
          state.user = null;
        }
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;
