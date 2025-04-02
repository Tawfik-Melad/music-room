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
  const { connectToRoom, uploadRoomId ,setUploadRoomId} = useContext(MainContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createUploadRoom = async () => {
      try {
          const response = await request.post(`/api/music-rooms/${room?.code}/`);
          // Store the music room data in your state or context
          setUploadRoomId(response.data.id);
          setLoading(false); // Data fetched, stop loading
      } catch (error) {
          console.error('Error creating upload room:', error);
          setError('Failed to create upload room.');
          setLoading(false); // Even on error, stop loading
      }
  };

  useEffect(() => {
      const initializeRoom = async () => {
          try {
              await createUploadRoom();
              if (uploadRoomId) {
                  connectToRoom(uploadRoomId, user.id);
              }
          } catch (error) {
              console.error('Error initializing room:', error);
          }
      };

      initializeRoom();
  }, [uploadRoomId]); // Add uploadRoomId as dependency

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
          <Playlist roomCode={room?.code} user={user} />
          <Chat room={room} user={user} />
      </div>
      <UserStatus room={room} user={user} />
              <RoomInfo room={room} />

    </div>
  );
};

export default Room;
