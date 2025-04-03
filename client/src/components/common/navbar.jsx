import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaHeadphones, FaMoon, FaSun } from "react-icons/fa";
import "../../styles/navbar.css"; // Ensure you have this CSS file

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    // You can implement actual theme switching logic here
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-blur-bg"></div>
      <div className="container">
        {/* Logo Section */}
        <div className="logo-section">
          <button className="home-btn" onClick={() => navigate("/")}>
            <FaHeadphones className="logo-icon" />
            <span className="logo-text">Rhythm</span>
          </button>
        </div>

        {/* Middle Section */}
        <div className="navbar-middle">
          <div className="music-wave">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
          <span className="navbar-title">Let's Listen Together</span>
        </div>

        {/* Profile & Actions Section */}
        <div className="profile-section">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDark ? <FaSun /> : <FaMoon />}
          </button>

          {/* Profile Info */}
          <div className="user-info">
            <div className="user-details">
              <span className="username">{user?.username || "Guest"}</span>
              <span className="user-status">Online</span>
            </div>
            <div className="profile-img-container" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <img
                src={user?.profile_picture || "/default-profile.jpg"}
                className="profile-img"
                alt="Profile"
              />
              <div className="online-indicator"></div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className={`logout-btn ${isHovered ? "hovered" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span className="logout-tooltip">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
