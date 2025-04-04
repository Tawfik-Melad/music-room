import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="custom-loading-screen">
      <div className="custom-loading-screen__content">
        <div className="custom-loading-screen__music-loader">
          <span className="custom-loading-screen__music-loader-bar"></span>
          <span className="custom-loading-screen__music-loader-bar"></span>
          <span className="custom-loading-screen__music-loader-bar"></span>
          <span className="custom-loading-screen__music-loader-bar"></span>
          <span className="custom-loading-screen__music-loader-bar"></span>
        </div>
        <h2 className="custom-loading-screen__text">Loading Room</h2>
        <p className="custom-loading-screen__subtext">Getting everything ready for you...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 