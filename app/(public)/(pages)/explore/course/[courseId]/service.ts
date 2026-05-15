import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const enrollLearningPlan = async (
  learningPlanId: string,
  token: string,
) => {
  const response = await axios.post(
    `${API_BASE_URL}/enrollments`,
    {
      learning_plan_id: learningPlanId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  return response.data;
};
