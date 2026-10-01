import axiosInstance from "@/lib/axios";

export interface PlanData {
  _id?: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  paymentType: string;
  features: string[];
  status?: string;
  productId?: string;
  priceId?: string;
}

export const planService = {
  getPlans: async () => {
    try {
      const response = await axiosInstance.get("/plan");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  createPlan: async (data: PlanData) => {
    try {
      const response = await axiosInstance.post("/plan", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updatePlan: async (id: string, data: Partial<PlanData>) => {
    try {
      const response = await axiosInstance.patch(`/plan/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  deletePlan: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/plan/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  createCheckoutSession: async (planId: string) => {
    try {
      const response = await axiosInstance.post(`/plan/create-checkout-session/${planId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
