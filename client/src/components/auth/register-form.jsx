import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../pre-request.js';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile_picture, setProfile_picture] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    
    if (profile_picture && profile_picture.size > 0) {
      formData.append('profile_picture', profile_picture);
    }

    try {
      const response = await request.post('/accounts/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate("/login");
    } catch (err) {
      if (err.response) {
        console.log('Error Response:', err.response.data);
        setError(JSON.stringify(err.response.data));
      } else {
        console.log('Error:', err.message);
        setError('Something went wrong.');
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Register</h2>
        {error && <p>{error}</p>}

        <div>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfile_picture(e.target.files[0])}
          />
        </div>

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
