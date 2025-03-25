// HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const HomePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle Join Room
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode) {
      setError('Please enter a room code.');
      return;
    }

    try {
      const response = await api.get(`/accounts/get-room/${roomCode}/`);
      navigate(`/room/`, { state: { room: response.data } });
    } catch (err) {
      setError('Invalid room code or unable to join.');
    }
  };

  // Handle Create Room
  const handleCreateRoom = async () => {
    try {
      const response = await api.post('/accounts/create-room/');
      navigate(`/room/`, { state: { room: response.data } });
    } catch (err) {
      setError('Failed to create a room.');
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h2 className="home-title">🎶 Welcome to Music Rooms!</h2>

        {error && <p className="error-message">{error}</p>}

        {/* Join Room Form */}
        <form onSubmit={handleJoinRoom}>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="home-input"
          />
          <button type="submit" className="home-button join">
            Join Room
          </button>
        </form>

        <p className="or-text">Or</p>

        <button onClick={handleCreateRoom} className="home-button create">
          Create Room
        </button>
      </div>
    </div>
  );
};

export default HomePage;
