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
import { GameProvider } from './components/gameManage.jsx';
import ComPortSelector from './components/comSelector.jsx';



function App() {
  return (
    <GameProvider>
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
          <Route path="/manage-com" element={<ComPortSelector />} />




        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
