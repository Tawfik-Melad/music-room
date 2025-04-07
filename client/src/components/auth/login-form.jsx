import React, { useState } from 'react';
import request from '../../pre-request.js';
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants.js";
import loginImage from '../../assets/login-image-desktop.png';
import loginImageMobile from '../../assets/login-image-phone.png';
import { FaMusic } from 'react-icons/fa';
import './music-theme.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const route = "accounts/token/";
        try {
            const response = await request.post(route, { username, password });
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
            navigate("/");
        } catch (err) {
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="simple-auth-wrapper">
            <div className="floating-notes">
                <FaMusic className="floating-note note1" />
                <FaMusic className="floating-note note2" />
                <FaMusic className="floating-note note3" />
            </div>
            <div className="simple-auth-content">
                <picture>
                    <source media="(min-width: 768px)" srcSet={loginImage} />
                    <source media="(max-width: 767px)" srcSet={loginImageMobile} />
                    <img src={loginImage} alt="Couple sharing music" className="login-illustration" />
                </picture>
                <div className="simple-login-form">
                    <h1 className="login-music-auth-form-title">Welcome Back!</h1>
                    <form onSubmit={handleSubmit}>
                        {error && <p className="simple-error">{error}</p>}
                        <div className="input-container">
                            <div className="login-music-auth-form-group">
                                <label htmlFor="username" className="login-music-auth-form-label">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    className="simple-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            <div className="login-music-auth-form-group">
                                <label htmlFor="password" className="login-music-auth-form-label">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="simple-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="simple-submit-btn">Sign In</button>
                    </form>
                    <div className="simple-link-container">
                        Don't have an account? <Link to="/register" className="simple-link">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
