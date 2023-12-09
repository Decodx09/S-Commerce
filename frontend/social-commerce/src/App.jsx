import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register.jsx'; 
import UserPage from './pages/UserPage.jsx';

const App = () => {

  <nav>
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/register">Register</Link></li>
    </ul>
  </nav>
  return (
    <div>

      <Routes>
        <Route path='/' element={<UserPage />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
