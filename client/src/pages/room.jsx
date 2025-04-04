import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import Chat from '../components/chat/main';
import UserStatus from '../components/user-status/main';
import Navbar from '../components/common/navbar';
import LoadingScreen from '../components/common/LoadingScreen';
import RoomInfo from '../components/room-info/main';
import Playlist from '../components/music/playlist';
import Song from '../components/music/song';
import request from '../pre-request';
import '../styles/room.css';
import '../styles/loading.css';
import { MainContext } from '../contexts/contexts';
import NotificationList from '../components/notification/NotificationList';

const Room = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { connectToRoom, uploadRoomId, setUploadRoomId, connectToNotifications, sendNotification } = useContext(MainContext);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // If we have state from navigation, use it
        if (location.state?.room && location.state?.user) {
          setRoomData(location.state.room);
          setUserData(location.state.user);
        } else {
          // If accessed directly, fetch the necessary data
          const userResponse = await request.get('/accounts/get-user/');
          setUserData(userResponse.data);

          // Extract room code from URL if possible, otherwise redirect to home
          const pathParts = location.pathname.split('/');
          const roomCode = pathParts[pathParts.length - 1];
          
          if (roomCode) {
            const roomResponse = await request.get(`/room/get/${roomCode}/`);
            setRoomData(roomResponse.data);
          } else {
            navigate('/');
            return;
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        setError('Failed to load room data');
        setLoading(false);
        // Redirect to home page after a short delay
        setTimeout(() => navigate('/'), 2000);
      }
    };

    initializeData();
  }, [location, navigate]);

  const createUploadRoom = async () => {
    try {
      const response = await request.post(`/api/music-rooms/${roomData?.code}/`);
      setUploadRoomId(response.data.id);
    } catch (error) {
      console.error('Error creating upload room:', error);
      setError('No room found');
    }
  };

  useEffect(() => {
    if (roomData && userData) {
      const initializeRoom = async () => {
        try {
          await createUploadRoom();
          if (uploadRoomId) {
            connectToRoom(uploadRoomId, userData.id);
            await connectToNotifications(uploadRoomId);
            
            setTimeout(() => {
              sendNotification(`${userData.username} has joined the room`, userData.username, "join");
            }, 1500);
          }
        } catch (error) {
          console.error('Error initializing room:', error);
        }
      };

      initializeRoom();
    }
  }, [uploadRoomId, roomData, userData]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="custom-loading-screen">
        <div className="custom-loading-screen__content">
          <h2 className="custom-loading-screen__text" style={{ color: '#ff6b6b' }}>{error}</h2>
          <p className="custom-loading-screen__subtext">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!roomData || !userData) {
    return <p>Redirecting to home page...</p>;
  }

  return (
    <div className="room-wrapper">
      <Navbar user={userData} />
      <div className="room-main-content">
        <div className="room-left-section">
          <Song roomCode={roomData?.code} user={userData} />
        </div>
        <div className="room-right-section">
          <UserStatus room={roomData} user={userData} />
        </div>
      </div>
      <div className="room-bottom-section">
        <div className="playlist-chat-container">
          <Playlist roomCode={roomData?.code} user={userData} />
          <Chat room={roomData} user={userData} />
        </div>
      </div>
      <NotificationList />
    </div>
  );
};

export default Room;
