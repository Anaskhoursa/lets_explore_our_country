import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});



export const getUsers = async () => {
  const res = await api.get('/get-users');
  return res.data.message;
};

export const addUser = async (userData) => {
  const res = await api.post('/add-user', userData);
  return res.data.message;
};
export const updateUser = async (userData) => {
  const res = await api.post('/update-user', userData);
  return res.data.message;
};

export const updateQuestion = async (userData) => {
  const res = await api.post('/update-question', userData);
  return res.data.message;
};

export const addQuestion = async (userData) => {
  const res = await api.post('/add-question', userData);
  return res.data.message;
};

export const getQuestions = async () => {
  const res = await api.get('/get-questions');
  return res.data.message;
};


export const getAll = async () => {
  console.log("Fetching data from server...");

  const users = await getUsers()
  const questions = await getQuestions()
  return {
    users: users,
    questions: questions
  }
}


export const adjustScore = async (userData) => {
  const res = await api.post('/adjust-score', userData);
  return res.data.message;
};

export const removeUser = async (userData) => {
  const res = await api.post('/remove-user', userData);
  return res.data.message;
};

export const removeQuestion = async (userData) => {
  const res = await api.post('/remove-question', userData);
  return res.data.message;
};

export const getMidiPorts = async () => {
  const res = await api.get('/get-midi-ports');
  return res.data.message;
};

export const setMidiPort = async (userData) => {
  const res = await api.post('/set-midi-port', userData);
  return res.data.message;
};

export const showCaspar = async (userData) => {
  const res = await api.post('/show-caspar', userData);
  return res.data.message;
};
export const showCorrectOption = async (userData) => {
  const res = await api.post('/show-correct', userData);
  return res.data.message;
};
export const showCorrectOption2 = async (userData) => {
  const res = await api.post('/show-correct2', userData);
  return res.data.message;
};
export const showCaspar2 = async (userData) => {
  const res = await api.post('/show-caspar2', userData);
  return res.data.message;
};

export const getCasparConfig = async () => {
  const res = await api.get('/get-caspar');
  return res.data.message;
};

export const updateCasparConfig = async (userData) => {
  const res = await api.post('/modify-caspar', userData);
  return res.data.message;
};

export const showScore = async (userData) => {
  const res = await api.post('/show-score', userData);
  return res.data.message;
};
export const showScore2 = async (userData) => {
  const res = await api.post('/show-score2', userData);
  return res.data.message;
};

export const showBackground = async (userData) => {
  const res = await api.post('/show-background', userData);
  return res.data.message;
};
export const showBackground2 = async (userData) => {
  const res = await api.post('/show-background2', userData);
  return res.data.message;
};

export const stopQ = async (userData) => {
  const res = await api.post('/stop-caspar', userData);
  return res.data.message;
};
export const stopQ2 = async (userData) => {
  const res = await api.post('/stop-caspar2', userData);
  return res.data.message;
};
export const stopScore = async (userData) => {
  const res = await api.post('/stop-score', userData);
  return res.data.message;
};
export const stopScore2 = async (userData) => {
  const res = await api.post('/stop-score2', userData);
  return res.data.message;
};
export const stopBackground = async (userData) => {
  const res = await api.post('/stop-background', userData);
  return res.data.message;
};
export const stopBackground2 = async (userData) => {
  const res = await api.post('/stop-background2', userData);
  return res.data.message;
};

export const playName = async (userData) => {
  const res = await api.post('/play-name', userData);
  return res.data.message;
};

export const stopName = async (userData) => {
  const res = await api.post('/stop-name', userData);
  return res.data.message;
};

export const playLogo = async (userData) => {
  const res = await api.post('/play-logo', userData);
  return res.data.message;
};

export const stopLogo = async (userData) => {
  const res = await api.post('/stop-logo', userData);
  return res.data.message;
};
export const resetAll = async () => {
  const res = await api.get('/reset-all');
  return res.data.message;
};

