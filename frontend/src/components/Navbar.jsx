import { Link } from 'react-router-dom';
import './Navbar.css';
import React from 'react';

function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">Quiz 2M V1</h1>
      <div className="nav-links">
        <Link to="/" className="nav-button">Dashboard</Link>
        <Link to="/add-user" className="nav-button">Add User</Link>
        <Link to="/add-question" className="nav-button">Add Question</Link>
        <Link to="/adjust-score" className="nav-button">Score Adjustment</Link>
        <Link to="/manage-game" className="nav-button">Manage the game</Link>
        <Link to="/manage-midi" className="nav-button">Manage Midi</Link>
        <Link to="/manage-caspar" className="nav-button">Manage Caspar</Link>
        <Link to="/manage-com" className="nav-button">Manage COM</Link>


      </div>
    </nav>
  );
}

export default Navbar;
