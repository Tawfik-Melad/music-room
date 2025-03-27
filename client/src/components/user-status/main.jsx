import { useState, useEffect, useRef } from 'react';
import request from '../../pre-request';


const UserStatus = ({ room, user }) => {
  const [users, setUsers] = useState([]);
  const ws = useRef(null);
  console.log('👥 Users before state update:', users);
  console.log('👥 Room:', room);
  // Initialize all room members as offline
  useEffect(() => {
    if (room?.members) {

      // Function to fetch user status
      const fetchUserStatus = async (username) => {
        try {
          // Replace with your actual endpoint
          const response = await request.get(`/room/status/${room.code}/members/${username}`);
          console.log(`🟢 Fetched status for ${username}:`, response.data);
          return response.data.connected ? "online" : "offline"; 
        } catch (error) {
          console.error(`⚠️ Failed to fetch status for ${username}:`, error);
          return "offline"; // Fallback if the API call fails
        }
      };

      // Function to fetch statuses for all members
      const fetchAllStatuses = async () => {
        try {
          // Wait for all member statuses to resolve
          const initialUsers = await Promise.all(
            room.members.map(async (member) => ({
              username: member,
              status: await fetchUserStatus(member),
            }))
          );
          // Set the users state after all promises resolve
          setUsers(initialUsers);
          console.log('👥 Initial Users:', initialUsers);
        } catch (error) {
          console.error("⚠️ Error fetching initial user statuses:", error);
        }
      };

      fetchAllStatuses(); // Call the async function
    }
  }, [room]); // Dependency array includes room

  // WebSocket connection to listen for user status updates
useEffect(() => {
  if (!room.code || !user.username) return;

  ws.current = new WebSocket(
    `ws://127.0.0.1:8000/ws/status/${room.code}/?user_id=${user.id}`
  );

  ws.current.onmessage = (e) => {
    const { user: updatedUser, status } = JSON.parse(e.data);
    console.log('🟢 User Status Update:', updatedUser, status);
    setUsers((prevUsers) => {
      const userExists = prevUsers.find((u) => u.username === updatedUser);

      if (userExists) {
        // Update existing user's status
        return prevUsers.map((u) =>
          u.username === updatedUser ? { ...u, status } : u
        );
      } else {
        // Add new user if not found
        return [...prevUsers, { username: updatedUser, status }];
      }
    });
  };

  // Cleanup on component unmount
  ws.current.onclose = () => {
    console.log('❌ WebSocket Disconnected room');
  };

  return () => {
    if (ws.current) {
      console.log('🔌 Closing WebSocket');
      ws.current.close();
    }
  };
}, [room.code, user]);
  useEffect(() => {
  console.log("👥 Users after state update:", users);
}, [users]);

  return (
    <div className="online-users">
      <h4>🟢 Online Users</h4>
      <ul>
        {users.map((user) => (
          <li key={user.username}>
            {user.username} - {user.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserStatus;
