import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";
import { getServerSession } from "next-auth";

// 1. Create a base configuration instance
const apiInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. Export a function to get the API client with the dynamic server session token
export async function getApi() {
  const session = await getServerSession(authOptions);
  const token = session?.laravelJwt;

  if (token) {
    apiInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    // Clean it up if there's no session, preventing token leakage between requests
    delete apiInstance.defaults.headers.common["Authorization"];
  }

  return apiInstance;
}
