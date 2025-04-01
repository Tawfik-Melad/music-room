import { useState, useEffect, useRef, useContext } from 'react';
import request from '../../pre-request';
import { MainContext } from '../../contexts/contexts';
import '../../styles/user-status.css';

const UserStatus = ({ room, user }) => {
  const { users, setUsers } = useContext(MainContext);
  const ws = useRef(null);
  const [loading, setLoading] = useState(true);

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
              lastSeen: new Date().toISOString(), // You can replace this with actual last seen data
            }))
          );
          console.log("initialUsers -------------- >", initialUsers);
          setUsers(initialUsers);
        } catch (error) {
          console.error("⚠️ Error fetching initial user statuses:", error);
        } finally {
          setLoading(false);
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
      console.log('❌ WebSocket Disconnected room');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [room.code, user]);

  if (loading) {
    return (
      <div className="user-list">
        {[1, 2, 3].map((n) => (
          <div key={n} className="user-card skeleton">
            <div className="profile-container">
              <div className="profile-pic-skeleton"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="user-list">
      {users.map((user) => (
        <div
          key={user.username}
          className={`user-card ${user.status === "online" ? "online" : "offline"}`}
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
            <div className="username">
              {user.username}
              {user.status === "offline" && (
                <div className="last-seen">
                  Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStatus;
