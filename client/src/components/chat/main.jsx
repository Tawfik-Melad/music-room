import { useEffect, useState, useRef ,useContext} from 'react';
import request from '../../pre-request';
import { RoomContext } from '../../contexts/room-contexts';
import '../../styles/chat.css';

const Chat = ({room , user}) => {

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messageEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isUserActive, getProfilePicture } = useContext(RoomContext);
  useEffect(() => {
      if (room?.messages) {
        const messageObjects = room.messages.map((msg) => ({
          sender: msg.user.username,          // Add sender
          content: msg.content,        // Add content
          timestamp: msg.timestamp,    // Add timestamp
        })); 
        setMessages(messageObjects);
      }
    }, []); 

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize WebSocket
  useEffect(() => {
    if (!room) return;
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room.code}/?user_id=${user.id}`);

    ws.onopen = () => {
      console.log('✅ Connected to WebSocket');
      setSocket(ws);
      setIsConnected(true);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('📩 Message Received:', data.message);

      setMessages((prev) => [
        ...prev,
        {
          sender: data.message.sender,
          content: data.message.content,
          timestamp: data.message.timestamp,
        },
      ]);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.log('⚠️ WebSocket Error:', error);
    };

    return () => ws.close();
  }, [room]);

  // Send Message
  const sendMessage = async () => {
    if (socket && inputMessage.trim() !== '') {
      const response = await request.post('/message/create/', {
        room_code: room.code,
        content: inputMessage,
      });

      const messageData = {
        type: "chat_message",
        message: {
          sender: user.username,
          content: inputMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };
      socket.send(JSON.stringify(messageData));
      setInputMessage('');
    }
  };

  // Helper: Format Date
  const formatTimestamp = (timestamp) => {
    const today = new Date().toDateString();
    const msgDate = new Date(timestamp).toDateString();
    return today === msgDate ? "Today" : "Yesterday";
  };

  if (!room) {
    return <p>No room data found.</p>;
  }

  return (
            <div className="chat-container">
            {/* Chat Messages */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p className="no-messages">No messages yet. Say hi! 👋</p>
                ) : (
                    messages.map((msg, idx) => {
                        const isCurrentUser = msg.sender === user.username;
                        return (
                            <div key={idx} className={`message-wrapper ${isCurrentUser ? "sent" : "received"}`}>
                                {!isCurrentUser && (
                                    <img
                                        className="profile-pic"
                                        src={getProfilePicture(msg.sender) || "/default-avatar.png"}
                                        alt={`${msg.sender}'s profile`}
                                    />
                                )}
                                <div className="message-content">
                                    {!isCurrentUser && (
                                        <span className="sender-name">
                                            {msg.sender}
                                            {isUserActive(msg.sender) ? " 🟢" : " ⚫"}
                                        </span>
                                    )}
                                    <div className="message-text">{msg.content}</div>
                                    <span className="timestamp">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messageEndRef} />
            </div>

            {/* Message Input */}
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
