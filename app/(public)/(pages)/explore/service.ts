import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const searchContent = async (query: string = "") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/learning-plans`, {
      params: { search: query, limit: query ? null : 4 },
    });


    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Error fetching modules:", error);
    return []; 
  }
};