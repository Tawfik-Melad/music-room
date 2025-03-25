import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Chat from '../components/chat/main';
import '../styles/room.css';

const Room = () => {
  const location = useLocation();
  const room = location.state?.room;
  

  return (

    <div className="room-container">
      <div className="room-card">
        <h2 className="room-title">🎶 {room?.name}</h2>
        <Chat room={room} />
      </div>
    </div>
  
  );
};

export default Room;
