import { useState, useEffect, useRef, useContext } from 'react';
import request from '../../pre-request';
import { MainContext } from '../../contexts/contexts';
import './user-status.css';

const UserStatus = ({ room, user }) => {
  const { users, setUsers, sendNotification } = useContext(MainContext);
  const ws = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

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
          setLoading(true);
          const initialUsers = await Promise.all(
            room.members.map(async (member) => ({
              username: member.username,
              status: await fetchUserStatus(member.username),
              profile_picture: member.profile_picture,
              lastSeen: new Date().toISOString(),
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

    const connectWebSocket = () => {
      ws.current = new WebSocket(
        `ws://127.0.0.1:8000/ws/status/${room.code}/?user_id=${user.id}`
      );

      ws.current.onopen = () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
        setLoading(false);
      };

      ws.current.onmessage = (e) => {
        const { user: updatedUser, status, profile_picture } = JSON.parse(e.data);
        setUsers((prevUsers) => {
          const userExists = prevUsers.find((u) => u.username === updatedUser);

          if (userExists) {
            return prevUsers.map((u) =>
              u.username === updatedUser 
                ? { 
                    ...u, 
                    status, 
                    profile_picture,
                    lastSeen: status === 'offline' ? new Date().toISOString() : u.lastSeen
                  } 
                : u
            );
          } else {
            return [...prevUsers, { 
              username: updatedUser, 
              status, 
              profile_picture,
              lastSeen: new Date().toISOString()
            }];
          }
        });
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        sendNotification(`${user.username} has left the room`, user.username, "leave");
        console.log('❌ WebSocket Disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('⚠️ WebSocket Error:', error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [room.code, user]);

  if (loading || !isConnected) {
    return (
      <div className="user-status-container">
        <div className="room-header">
          <div className="room-code">Room: <span className="skeleton-text"></span></div>
        </div>
        <div className="user-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="user-card skeleton">
              <div className="profile-container">
                <div className="profile-pic-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
        {!isConnected && (
          <div className="connection-status">
            <div className="connecting-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Connecting to real-time updates...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="user-status-container">
      <div className="room-header">
        <div className="room-code">Room: {room.code}</div>
      </div>
      <div className="user-list">
        {users.map((user) => (
          <div
            key={user.username}
            className={`user-card ${user.status === "online" ? "online" : "offline"} ${user.username === room.host?.username ? "host" : ""}`}
          >
            <div className="profile-container">
              <img 
                src={user.profile_picture || '/default-avatar.png'} 
                alt={user.username} 
                className="profile-pic"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span className="status-dot"></span>
            </div>
            <div className="username">
              {user.username}
              {user.status === "offline" && (
                <div className="last-seen">
                  Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStatus;
