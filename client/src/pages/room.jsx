import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
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
  const { room, user } = location.state || {};
  const { 
    connectToRoom, 
    uploadRoomId, 
    setUploadRoomId, 
    connectToNotifications, 
    sendNotification 
  } = useContext(MainContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initTimeout = useRef(null);

  const createUploadRoom = async () => {
    try {
      const response = await request.post(`/api/music-rooms/${room?.code}/`);
      setUploadRoomId(response.data.id);
      console.log("Upload room created:", response.data.id);
      return true;
    } catch (error) {
      console.error('Error creating upload room:', error);
      setError('Failed to create upload room.');
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeRoom = async () => {
      if (!room || !user || isInitialized) return;

      try {
        setLoading(true);
        const uploadRoomCreated = await createUploadRoom();
        
        if (!uploadRoomCreated) return;

        if (uploadRoomId) {
          // Connect to room with a small delay to ensure proper initialization
          await new Promise(resolve => setTimeout(resolve, 500));
          await connectToRoom(uploadRoomId, user.id);
          
          // Connect to notifications with a small delay
          await new Promise(resolve => setTimeout(resolve, 500));
          await connectToNotifications(uploadRoomId);
          console.log("Connected to notifications");

          // Wait 1 seconds before sending notification
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Send join notification after connections are established
          if (mounted) {
            console.log("Sending join notification");
            sendNotification(`${user.username} has joined the room`, user.username, "join");
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Error initializing room:', error);
        if (mounted) {
          setError('Failed to initialize room.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Clear any existing timeout
    if (initTimeout.current) {
      clearTimeout(initTimeout.current);
    }

    // Add a small delay before initialization
    initTimeout.current = setTimeout(initializeRoom, 100);

    return () => {
      mounted = false;
      if (initTimeout.current) {
        clearTimeout(initTimeout.current);
      }
    };
  }, [room?.code, user?.id, uploadRoomId, isInitialized]);

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

  if (!room || !user) {
    return <p>Redirecting to home page...</p>;
  }

  return (
    <div className="room-wrapper">
      <Navbar user={user} />
      <div className="room-main-content">
        <div className="room-left-section">
          <Song roomCode={room?.code} user={user} />
        </div>
        <div className="room-right-section">
          <UserStatus room={room} user={user} />
        </div>
      </div>
      <div className="room-bottom-section">
        <div className="playlist-chat-container">
          <Playlist roomCode={room?.code} user={user} />
          <Chat room={room} user={user} />
        </div>
      </div>
      <NotificationList />
    </div>
  );
};

export default Room;
