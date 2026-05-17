import axios from "axios";
import { Course } from "./type";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const getRecentCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/learning-plans`, {
      params: {
        limit: 4,
      },
    });

    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching recent courses:", error);
    return [];
  }
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/learning-plans`, {
      params: {
        search: query,
      },
    });

    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error searching courses:", error);
    return [];
  }
};
