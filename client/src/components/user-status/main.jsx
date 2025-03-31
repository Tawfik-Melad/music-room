import { useState, useEffect, useRef ,useContext} from 'react';
import request from '../../pre-request';
import { RoomContext } from '../../contexts/room-contexts';

const UserStatus = ({ room, user }) => {
  const { users, setUsers } = useContext(RoomContext);
  const ws = useRef(null);

  // Initialize all room members as offline
  useEffect(() => {
    if (room?.members) {
      const fetchUserStatus = async (username) => {
        try {
          const response = await request.get(`/room/status/${room.code}/members/${username}`);
          return response.data.connected ? "online" : "offline"; 
        } catch (error) {
          console.error(`⚠️ Failed to fetch status for ${username}:`, error);
          return "offline";
        }
      };

      const fetchAllStatuses = async () => {
        try {
          const initialUsers = await Promise.all(
            room.members.map(async (member) => ({
              username: member,
              status: await fetchUserStatus(member),
            }))
          );
          setUsers(initialUsers);
        } catch (error) {
          console.error("⚠️ Error fetching initial user statuses:", error);
        }
      };

      fetchAllStatuses();
    }
  }, [room]);

  // WebSocket connection to listen for user status updates
  useEffect(() => {
    if (!room.code || !user.username) return;

    ws.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/status/${room.code}/?user_id=${user.id}`
    );

    ws.current.onmessage = (e) => {
      const { user: updatedUser, status } = JSON.parse(e.data);
      setUsers((prevUsers) => {
        const userExists = prevUsers.find((u) => u.username === updatedUser);

        if (userExists) {
          return prevUsers.map((u) =>
            u.username === updatedUser ? { ...u, status } : u
          );
        } else {
          return [...prevUsers, { username: updatedUser, status }];
        }
      });
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket Disconnected room');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [room.code, user]);

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.username}>
            <span>{user.username}</span>
            <img src={user?.profile_picture} alt={user.username} />
            <span>
              {user.status === 'online' ? '🟢 Online' : '⚫ Offline'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserStatus;
