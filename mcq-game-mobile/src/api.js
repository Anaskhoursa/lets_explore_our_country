import axios from 'axios';

const API = axios.create({
  baseURL: 'http://10.249.1.23:5000/api',
});

export const getUsers = () => API.get('/get-users').then(res => res.data.message);
export const getQuestions = () => API.get('/get-questions').then(res => res.data.message);

export const getAll = async () => {

  try {

    const questions = await getQuestions();
    const users = await getUsers();

    

    return {
      users,
      questions,
    };
  } catch (error) {
    throw error;
  }
};


