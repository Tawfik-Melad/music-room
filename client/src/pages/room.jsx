import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Chat from '../components/chat/main';
import UserStatus from '../components/user-status/main';
import '../styles/room.css';

const Room = () => {
  const location = useLocation();
  const room = location.state?.room;
  const user = location.state?.user;

  return (

    <div className="room-container">
      <div className="room-card">
        <h2 className="room-title">🎶 {room?.name}</h2>
        <h2 className="room-title">🎶 {user?.username}</h2>
        <Chat room={room} user={user} />
      </div>
      <UserStatus room={room} user={user} />
    </div>
  
  );
};

export default Room;
