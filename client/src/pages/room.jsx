import { useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import Chat from '../components/chat/main';
import UserStatus from '../components/user-status/main';
import Navbar from '../components/common/navbar';
import RoomInfo from '../components/room-info/main';
import Playlist from '../components/music/playlist';
import Song from '../components/music/song';
import request from '../pre-request';
import '../styles/room.css';
import { MainContext } from '../contexts/contexts';

const Room = () => {
  const location = useLocation();
  const room = location.state?.room;
  const user = location.state?.user;
  const { connectToRoom } = useContext(MainContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createUploadRoom = async () => {
      try {
          await request.post(`/api/music-rooms/${room?.code}/`);
          setLoading(false); // Data fetched, stop loading
      } catch (error) {
          console.error('Error creating upload room:', error);
          setError('Failed to create upload room.');
          setLoading(false); // Even on error, stop loading
      }
  };

  useEffect(() => {
      createUploadRoom(); 
      connectToRoom(room?.code);
  }, [room?.code]);

  // Show loading or error message
  if (loading) {
      return <p>Loading Music Room...</p>;
  }

  if (error) {
      return <p>{error}</p>;
  }

  return (
    <div className="room-wrapper">
        <Navbar user={user} />
          <Song roomCode={room?.code} user={user} />
      <div className='playlist-chat-container'>
          <Playlist roomCode={room?.code} />
          <Chat room={room} user={user} />
      </div>
      <UserStatus room={room} user={user} />
              <RoomInfo room={room} />

    </div>
  );
};

export default Room;
