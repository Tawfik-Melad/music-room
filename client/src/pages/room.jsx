import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Chat from '../components/chat/main';
import UserStatus from '../components/user-status/main';
import MusicPlayer from '../components/music/main';
import Navbar from '../components/common/navbar';
import { RoomProvider } from '../contexts/room-contexts';
import RoomInfo from '../components/room-info/main';
const Room = () => {
  const location = useLocation();
  const room = location.state?.room;
  const user = location.state?.user;
  console.log("room ",room);
  return (
    <RoomProvider>
    <Navbar user={user}/>
    <div>
      <div>

      </div>
      
      <div>
        <RoomInfo room={room} />
        <MusicPlayer roomCode={room?.code} />
        <Chat room={room} user={user} />
      </div>
      
      <UserStatus room={room} user={user} />
      </div>
      </RoomProvider>
  );
};

export default Room;
