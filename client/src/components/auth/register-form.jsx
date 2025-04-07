import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import request from '../../pre-request.js';
import { FaMusic } from 'react-icons/fa';
import loginImage from '../../assets/login-image-desktop.png';
import loginImageMobile from '../../assets/login-image-phone.png';
import './music-theme.css';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile_picture, setProfile_picture] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="music-auth-wrapper">
      <div className="floating-notes">
        <FaMusic className="floating-note note1" />
        <FaMusic className="floating-note note2" />
        <FaMusic className="floating-note note3" />
      </div>
      <div className="music-auth-content">
        <picture>
          <source media="(min-width: 768px)" srcSet={loginImage} />
          <source media="(max-width: 767px)" srcSet={loginImageMobile} />
          <img src={loginImage} alt="Couple sharing music" className="music-auth-image-container" />
        </picture>
        <div className="login-music-auth-form-container">
          <h1 className="login-music-auth-form-title">Join the Music Community!</h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {error && <p className="login-music-auth-error">{error}</p>}
            
            <div className="input-container">
              {/* Left Column */}
              <div className="login-music-auth-form-group">
                <label htmlFor="username" className="login-music-auth-form-label">Username</label>
                <input
                  id="username"
                  type="text"
                  className="login-music-auth-form-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="login-music-auth-form-group">
                <label htmlFor="password" className="login-music-auth-form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="login-music-auth-form-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="login-music-auth-form-group">
                <label htmlFor="confirmPassword" className="login-music-auth-form-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="login-music-auth-form-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Right Column */}
              <div className="login-music-auth-form-group">
                <label htmlFor="email" className="login-music-auth-form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="login-music-auth-form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-music-auth-form-group">
                <label htmlFor="profile_picture" className="login-music-auth-form-label">Profile Picture</label>
                <div className="file-input-wrapper">
                  <input
                    id="profile_picture"
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => setProfile_picture(e.target.files[0])}
                  />
                  <div className="file-input-placeholder">
                    {profile_picture ? profile_picture.name : 'Choose a file...'}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="login-music-auth-form-group">
                <button type="submit" className="login-music-auth-submit-btn">
                  Create Account
                </button>
              </div>
            </div>
          </form>
          <div className="login-music-auth-link-container">
            Already have an account? <Link to="/login" className="login-music-auth-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
