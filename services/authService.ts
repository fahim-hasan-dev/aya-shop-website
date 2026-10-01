import axiosInstance from "@/lib/axios";

export const authService = {
  adminLogin: async (credentials: any) => {
    try {
      const response = await axiosInstance.post("/auth/admin-login", credentials);
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data || {};
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", "admin");
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials: any, role?: 'client' | 'business') => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      if (response.data.success) {
        const { accessToken, refreshToken, userInfo } = response.data.data || {};
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (userInfo) {
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          if (userInfo.role) localStorage.setItem("userRole", userInfo.role.toLowerCase());
        } else if (role) {
          localStorage.setItem("userRole", role);
        }

        // Set session cookie for middleware
        const maxAge = 60 * 60 * 24 * 30;
        document.cookie = `aya_client_session=1; path=/; max-age=${maxAge}; samesite=lax`;
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData: { email: string; fullName: string; password: string; role?: string }) => {
    try {
      const payload = {
        ...userData,
        role: (userData.role || "client").toLowerCase(),
      };
      const response = await axiosInstance.post("/auth/signup", payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  verifyAccount: async (data: { email?: string; phone?: string; oneTimeCode: string }) => {
    try {
      const response = await axiosInstance.post("/auth/verify-account", data);
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, userInfo } = response.data.data || {};
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (userInfo) {
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          if (userInfo.role) localStorage.setItem("userRole", userInfo.role.toLowerCase());
        }

        const maxAge = 60 * 60 * 24 * 30;
        document.cookie = `aya_client_session=1; path=/; max-age=${maxAge}; samesite=lax`;
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  resendOtp: async (data: { email?: string; phone?: string; authType: 'createAccount' | 'resetPassword' }) => {
    try {
      const response = await axiosInstance.post("/auth/resend-otp", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  forgetPassword: async (data: { email?: string; phone?: string }) => {
    try {
      const response = await axiosInstance.post("/auth/forget-password", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (data: { newPassword: string; confirmPassword: string }, token?: string) => {
    try {
      const headers = token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {};
      const response = await axiosInstance.post("/auth/reset-password", data, { headers });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userInfo");
    
    // Clear session cookie
    document.cookie = "aya_client_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    window.location.href = "/auth";
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },
};
