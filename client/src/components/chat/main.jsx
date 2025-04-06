import { useEffect, useState, useRef, useContext } from 'react';
import request from '../../pre-request';
import { MainContext } from '../../contexts/contexts';
import './chat.css';

const Chat = ({ room, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isUserActive, getProfilePicture } = useContext(MainContext);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef(null);

  // Load initial messages
  useEffect(() => {
    if (room?.messages) {
      const messageObjects = room.messages.map((msg) => ({
        sender: msg.user.username,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      setMessages(messageObjects);
    }
  }, [room?.messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize WebSocket
  useEffect(() => {
    if (!room?.code || !user?.id) return;

    const connectWebSocket = () => {
      // Clean up any existing connection
      if (socketRef.current) {
        console.log('🔄 Cleaning up existing WebSocket connection');
        socketRef.current.close(1000, 'Reconnecting');
        socketRef.current = null;
      }

      try {
        console.log('🔄 Attempting to connect to chat WebSocket...');
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room.code}/?user_id=${user.id}`);

        ws.onopen = () => {
          console.log('🟢 Chat WebSocket connected successfully');
          socketRef.current = ws;
          setIsConnected(true);
          reconnectAttempts.current = 0;
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            setMessages((prev) => [
              ...prev,
              {
                sender: data.message.sender,
                content: data.message.content,
                timestamp: data.message.timestamp,
              },
            ]);
          } catch (error) {
            console.error('⚠️ Error parsing chat message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log('🔴 Chat WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          
          // Attempt to reconnect if not closed normally
          if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current += 1;
            console.log(`Attempting to reconnect chat (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            reconnectTimeout.current = setTimeout(connectWebSocket, 2000 * reconnectAttempts.current);
          }
        };

        ws.onerror = (error) => {
          console.error('⚠️ Chat WebSocket Error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('⚠️ Error creating chat WebSocket:', error);
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
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [room?.code, user?.id]);

  // Send Message
  const sendMessage = async () => {
    if (socketRef.current && inputMessage.trim() !== '') {
      try {
        const response = await request.post('/message/create/', {
          room_code: room.code,
          content: inputMessage,
        });

        const messageData = {
          type: "chat_message",
          message: {
            sender: user.username,
            content: inputMessage,
            timestamp: new Date().toISOString(),
          },
        };
        socketRef.current.send(JSON.stringify(messageData));
        setInputMessage('');
      } catch (error) {
        console.error('⚠️ Error sending message:', error);
      }
    }
  };

  // Helper: Format Date
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      const today = new Date().toDateString();
      const msgDate = date.toDateString();
      return today === msgDate ? "Today" : "Yesterday";
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Helper: Format Time
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid Time";
      }
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "Invalid Time";
    }
  };

  if (!room) {
    return <p>No room data found.</p>;
  }

  return (
    <div className="chat-container">
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">
            Start the conversation!<br />
            <span style={{ fontSize: '14px', color: '#888' }}>Be the first to say hello 👋</span>
          </p>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.sender === user.username;
            return (
              <div key={idx} className={`message-wrapper ${isCurrentUser ? "sent" : "received"}`}>
                {!isCurrentUser && (
                  <img
                    className={`profile-pic ${isUserActive(msg.sender) ? "online" : "offline"}`}
                    src={getProfilePicture(msg.sender) || "/default-avatar.png"}
                    alt={`${msg.sender}'s profile`}
                  />
                )}
                <div className="message-content">
                  {!isCurrentUser && (
                    <span className="sender-name">
                      {msg.sender}
                    </span>
                  )}
                  <div className="message-text">{msg.content}</div>
                  <span className="timestamp">
                    {formatTime(msg.timestamp)}
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
