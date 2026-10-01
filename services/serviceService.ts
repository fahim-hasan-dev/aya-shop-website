import axiosInstance from "@/lib/axios";

export const serviceService = {
  getServices: async (params?: { page?: number; limit?: number; search?: string; searchTerm?: string }) => {
    try {
      const response = await axiosInstance.get("/service", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getMyServices: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await axiosInstance.get("/service/my-services", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getSingleService: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/service/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  createService: async (data: FormData) => {
    try {
      const response = await axiosInstance.post("/service", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateService: async (id: string, data: FormData) => {
    try {
      const response = await axiosInstance.patch(`/service/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  deleteService: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/service/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  toggleStatus: async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/service/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getTopRatedServices: async () => {
    try {
      const response = await axiosInstance.get("/service", {
        params: { limit: 10, page: 1, sort: "-rating.averageRating" },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getServiceAvailability: async (id: string, date: string) => {
    try {
      const response = await axiosInstance.get(`/service/${id}/availability`, {
        params: { date },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
