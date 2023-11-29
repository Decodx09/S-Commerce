import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    email: '',
    password: '',
    Admin: false,
    bio: '',
    cart: null,
    items: [],
    followers: [],
    followings: [],
    checkout: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5554/user/register', formData);
      console.log('Registration successful:', response.data);
      // Handle success, e.g., redirect the user to another page
    } catch (error) {
      console.error('Registration failed:', error.response.data);
      // Handle error, e.g., display an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Add form fields for each property in the schema */}
      <label>
        First Name:
        <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
      </label>
      {/* Add similar labels and inputs for other fields */}

      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
