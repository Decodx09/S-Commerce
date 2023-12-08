import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home.jsx';
import Register from './pages/register.jsx'; // Assuming you have a Register component

const App = () => {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/register">Register</Link></li>
          <h2>shivansh</h2>
        </ul>
      </nav>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
