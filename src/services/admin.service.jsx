import axios from 'axios';
import config from "../environment/config";
import { authHeader } from './auth.header';
const API_URL = config.API_URL;


export const getUserManagerList = async () => {
  try {
    const response = await axios.get(`${API_URL}api/user-manager`, {
      headers: {
        ...authHeader(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user manager list:", error);
    throw error;
  }
}


export const getAuditStampingList = async () => {
  try {
    const response = await axios.get(`${API_URL}api/audit-stamping`, {
      headers: {
        ...authHeader(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching audit stamping list:", error);
    throw error;
  }
}
