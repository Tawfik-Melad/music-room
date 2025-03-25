import { useEffect, useState, useRef } from 'react';
import request from '../../pre-request';

const Chat = ({room}) => {

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messageEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
      if (room?.messages) {
        const messageObjects = room.messages.map((msg) => ({
          sender: msg.sender,          // Add sender
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
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room.code}/`);

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
      console.log('❌ WebSocket Disconnected');
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
          sender: "You",
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 text-gray-900">
        
        {/* Room Info */}
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-extrabold mb-2">🎤 {room.code}</h2>
          <p className="text-lg font-medium">👑 Host: {room.host}</p>
          <p className="text-sm">🧑‍🤝‍🧑 {room.members?.length || 0} Members</p>
        </div>

        {/* Connection Status */}
        <div className="mb-2 text-center">
          {isConnected ? (
            <span className="text-green-500">🟢 Connected</span>
          ) : (
            <span className="text-red-500">🔴 Disconnected</span>
          )}
        </div>

        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto p-4 border rounded-xl bg-gray-100">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Say hi! 👋</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === "You" ? "items-end" : "items-start"
                } mb-3`}
              >
                <span className="text-xs text-gray-500">
                  {msg.sender} — {formatTimestamp(msg.timestamp)}
                </span>
                <div
                  className={`px-4 py-2 rounded-lg shadow-md ${
                    msg.sender === "You"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex mt-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-full transition-all duration-200"
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
