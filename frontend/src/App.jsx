import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AddQuestion from './components/addQuestion.jsx';
import AddUser from './components/addUSER.JSX';
import AdjustScore from './components/adjustScore.jsx';
import ManageGame from './components/manageGame.jsx';
import React from 'react';
import ManageMidi from './components/manageMidi.jsx';
import ManageCasparSettings from './components/manageCaspar.jsx';



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/add-question" element={<AddQuestion />} />
        <Route path="/adjust-score" element={<AdjustScore />} />
        <Route path="/manage-game" element={<ManageGame />} />
        <Route path="/manage-midi" element={<ManageMidi />} />
        <Route path="/manage-caspar" element={<ManageCasparSettings />} />



      </Routes>
    </Router>
  );
}

export default App;
