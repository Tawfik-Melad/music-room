import React, { useState } from 'react';
import api from '../api.js';
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import '../styles/longin.css';


const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const route = "api/token/";
        try {
            const response = await api.post(route, { username, password });
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
            console.log('Login successful:', response);
            navigate("/");
        } catch (err) {
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Username:</label>
                <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Password:</label>
                <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button className="login-button" type="submit">Login</button>
        </form>
    );
};

export default LoginForm;