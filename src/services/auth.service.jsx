import axios from 'axios';
import config from '../environment/config';


const API_URL = config.API_URL;

export const login = async (username, password) => {
  try {

    const response = await axios.post(`${API_URL}authenticate`, {
      username: username,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const token = response.data.token;
    if (token) {
      //localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
        token: response.data.token,
        username: username
      }));
      
    }

    return response;
  } catch (error) {
    console.error('Error occurred in login:', error);
    throw error;

  }
};

export const logout = async () => {
      try {
        localStorage.removeItem('user');
        localStorage.clear();

      } catch (error) {
        console.error('Error occurred in logout:', error);
        throw error; 
      }
  };
