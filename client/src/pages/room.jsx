import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Chat from '../components/chat/main';
import UserStatus from '../components/user-status/main';
import '../styles/room.css';
import MusicPlayer from '../components/music/main';

const Room = () => {
  const location = useLocation();
  const room = location.state?.room;
  const user = location.state?.user;

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-title">{room?.name}</div>
        <div className="user-name">{user?.username}</div>
      </div>
      
      <div className="main-content">
        <MusicPlayer roomCode={room?.code} />
        <Chat room={room} user={user} />
      </div>
      
      <UserStatus room={room} user={user} />
    </div>
  );
};

export default Room;
