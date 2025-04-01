import { createContext, useState, useEffect, useRef } from 'react';

export const MainContext = createContext(null);

export const MainProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const audioRef = useRef(null);
    const wsRef = useRef(null);

    const connectToRoom = (roomId) => {
        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Create new WebSocket connection for specific room
        wsRef.current = new WebSocket(`ws://localhost:8000/ws/roomSong/${roomId}/`);

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'song_update') {
                // Add new song to the songs list
                setSongs(prevSongs => [...prevSongs, data.song]);
            }
        };

        wsRef.current.onclose = () => {
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                if (wsRef.current.readyState === WebSocket.CLOSED) {
                    connectToRoom(roomId);
                }
            }, 3000);
        };
    };

    const clearData = () => {
        setUsers([]);
        setSongs([]);
        setCurrentSong(null);
        setIsPlaying(false);
        setUploadError(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };
    
    const isUserActive = (username) => {
        const user = users.find(user => user.username === username);
        return user ? user.status === 'online' : false;
    };
    
    const getProfilePicture = (username) => {
        const user = users.find(user => user.username === username);
        return user ? user.profile_picture : null; // Return the URL or null if not found
    };

    const broadcastNewSong = (song) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'new_song',
                song: song
            }));
        }
    };
    
    return (
        <MainContext.Provider value={{
            users,
            setUsers,
            isUserActive,
            getProfilePicture,
            songs,
            setSongs,
            currentSong,
            setCurrentSong,
            isPlaying,
            setIsPlaying,
            uploadError,
            audioRef,
            clearData,
            connectToRoom,
            broadcastNewSong
        }}>
            {children}
        </MainContext.Provider>
    );
};
