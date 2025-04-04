// HomePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../pre-request';
import Navbar from '../components/common/navbar';
import musicShareIllustration from '../styles/ChatGPT Image Mar 30, 2025, 06_01_24 PM.png';
import '../styles/home.css';
import { MainContext } from '../contexts/contexts';
const HomePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { clearData,setCurrentUser } = useContext(MainContext);
  // get user info
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await request.get('/accounts/get-user/');
        setUser(response.data);
        setCurrentUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
    clearData();
  }, []);

  // Handle Join Room
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode) {
      setError('Please enter a room code.');
      return;
    }

    try {
      const response = await request.get(`/room/get/${roomCode}/`);
      navigate(`/room/`, { state: { room: response.data, user: user } });
    } catch (err) {
      setError('Invalid room code or unable to join.');
    }
  };

  // Handle Create Room
  const handleCreateRoom = async () => {
    try {
      const response = await request.post('/room/create/');

      navigate(`/room/`, { state: { room: response.data, user: user } });
    } catch (err) {
      setError('Failed to create a room.');
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="home-container">
        <div className="content-wrapper">
          <div className="illustration-container">
            <img 
              src={musicShareIllustration} 
              alt="Music Sharing Illustration" 
              className="music-share-illustration"
            />
          </div>
          <div className="form-container">
            <h1 className="welcome-text">Share Music Together</h1>
            <p className="subtitle">Join or create a room to start sharing music with friends</p>

            {error && <p className="error-message">{error}</p>}

            {/* Join Room Form */}
            <form onSubmit={handleJoinRoom} className="room-form">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="room-input"
              />
              <button type="submit" className="btn btn-join">
                Join Room
              </button>
            </form>

            <div className="divider">or</div>

            <button onClick={handleCreateRoom} className="btn btn-create">
              Create New Room
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
