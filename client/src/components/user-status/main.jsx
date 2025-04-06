import { useState, useEffect, useRef, useContext } from 'react';
import request from '../../pre-request';
import { MainContext } from '../../contexts/contexts';
import './user-status.css';

const UserStatus = ({ room, user }) => {
  const { users, setUsers, sendNotification } = useContext(MainContext);
  const ws = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef(null);

  // WebSocket connection
  useEffect(() => {
    if (!room?.code || !user?.id) {
      console.log('⚠️ Missing room code or user info');
      return;
    }

    const connectWebSocket = () => {
      // Clean up any existing connection
      if (ws.current) {
        console.log('🔄 Cleaning up existing WebSocket connection');
        ws.current.close(1000, 'Reconnecting');
        ws.current = null;
      }

      try {
        console.log('🔄 Attempting to connect to WebSocket...');
        ws.current = new WebSocket(
          `ws://127.0.0.1:8000/ws/status/${room.code}/?user_id=${user.id}`
        );

        ws.current.onopen = () => {
          console.log('🟢 WebSocket connected successfully');
          setIsConnected(true);
          reconnectAttempts.current = 0;
        };

        ws.current.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            
            // Handle different message types
            switch (data.type) {
              case 'connection_established':
                console.log('✅ Connection established:', data.message);
                setUsers((prevUsers) => [
                  ...prevUsers,
                  {
                    username: data.user,
                    status: data.status,
                    profile_picture: data.profile_picture,
                    lastSeen: new Date().toISOString()
                  }
                ]);
                setDataReady(true);
                setLoading(false);
                break;
                
              case 'user_status':
                const { user: updatedUser, status, profile_picture } = data;
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
                break;
                
              case 'error':
                console.error('⚠️ Server error:', data.message);
                break;
                
              default:
                console.warn('⚠️ Unknown message type:', data.type);
            }
          } catch (error) {
            console.error('⚠️ Error parsing WebSocket message:', error);
          }
        };

        ws.current.onclose = (event) => {
          console.log('🔴 WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          
          // Don't send notification if it's a normal closure
          if (event.code !== 1000) {
            sendNotification(`${user.username} has left the room`, user.username, "leave");
          }
          
          // Attempt to reconnect if not closed normally
          if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current += 1;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            reconnectTimeout.current = setTimeout(connectWebSocket, 2000 * reconnectAttempts.current);
          }
        };

        ws.current.onerror = (error) => {
          console.error('⚠️ WebSocket Error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('⚠️ Error creating WebSocket:', error);
        setIsConnected(false);
      }
    };

    // Add a small delay before connecting
    const timeoutId = setTimeout(connectWebSocket, 500);

    return () => {
      clearTimeout(timeoutId);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [room?.code, user?.id]);

  // Fetch user statuses after WebSocket connection is established
  useEffect(() => {
    if (!isConnected || !room?.members) return;

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
        setDataReady(true);
        setLoading(false);
      } catch (error) {
        console.error("⚠️ Error fetching initial user statuses:", error);
        setLoading(false);
      }
    };

    fetchAllStatuses();
  }, [isConnected, room?.members]);

  if (loading || !isConnected || !dataReady) {
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
