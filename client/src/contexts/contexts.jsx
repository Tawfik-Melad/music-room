import { createContext, useState, useEffect, useRef } from 'react';

export const MainContext = createContext(null);

export const MainProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadRoomId, setUploadRoomId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const audioRef = useRef(null);
    const wsRef = useRef(null);
    const notificationWsRef = useRef(null);

    const connectToRoom = (roomId, userId) => {
        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Create new WebSocket connection for specific room with user ID
        wsRef.current = new WebSocket(`ws://localhost:8000/ws/roomSong/${roomId}/?user_id=${userId}`);

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'song_update') {
                // Add new song to the songs list
                setSongs(prevSongs => [...prevSongs, data.song]);
            } else if (data.type === 'like_update') {
                // Update song likes count and liked usernames
                setSongs(prevSongs => {
                    const updatedSongs = prevSongs.map(song => {
                        if (song.id === data.song_id) {
                            return {
                                ...song,
                                likes_count: data.likes_count,
                                liked_by: data.liked_usernames
                            };
                        }
                        return song;
                    });

                    // If the liked song is the current song, update it
                    if (currentSong && currentSong.id === data.song_id) {
                        const updatedSong = updatedSongs.find(s => s.id === data.song_id);
                        setCurrentSong(updatedSong);
                    }

                    return updatedSongs;
                });
            } else if (data.type === 'listening_update') {
                // Update song listening users
                setSongs(prevSongs => {
                    const updatedSongs = prevSongs.map(song => {
                        if (song.id === data.song_id) {
                            return {
                                ...song,
                                listening_users: data.listening_users
                            };
                        }
                        return song;
                    });

                    // If the updated song is the current song, update it
                    if (currentSong && currentSong.id === data.song_id) {
                        const updatedSong = updatedSongs.find(s => s.id === data.song_id);
                        setCurrentSong(updatedSong);
                    }

                    return updatedSongs;
                });
            }
        };

        wsRef.current.onclose = () => {
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                if (wsRef.current.readyState === WebSocket.CLOSED) {
                    connectToRoom(roomId, userId);
                }
            }, 3000);
        };
    };

    const connectToNotifications = (roomId) => {
        // Close existing notification connection if any
        if (notificationWsRef.current) {
            notificationWsRef.current.close();
        }

        // Create new WebSocket connection for notifications
        notificationWsRef.current = new WebSocket(`ws://localhost:8000/ws/notifications/${roomId}/`);

        notificationWsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications(prevNotifications => [...prevNotifications,
            { message: data.message, username: data.username, action: data.action }]);
        };

        notificationWsRef.current.onclose = () => {
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                if (notificationWsRef.current.readyState === WebSocket.CLOSED) {
                    connectToNotifications(roomId);
                }
            }, 3000);
        };
    };

    const sendNotification = (message, username, action) => {
        console.log('hi mother father 2',message, username, action);
        if (notificationWsRef.current && notificationWsRef.current.readyState === WebSocket.OPEN) {
            console.log('hi mother father 3');
            notificationWsRef.current.send(JSON.stringify({
                message: message,
                username: username,
                action: action
            }));
        }
    };

    const clearData = () => {
        // Send leave notification if we have a current user
        if (currentUser) {
            sendNotification(`${currentUser.username} left the room`, currentUser.username, 'leave');
        }

        setUsers([]);
        setSongs([]);
        setCurrentSong(null);
        setIsPlaying(false);
        setUploadError(null);
        setNotifications([]);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (notificationWsRef.current) {
            notificationWsRef.current.close();
            notificationWsRef.current = null;
        }
    };
    
    const isUserActive = (username) => {
        const user = users.find(user => user.username === username);
        return user ? user.status === 'online' : false;
    };
    
    const getProfilePicture = (username) => {
        const user = users.find(user => user.username === username);
        return user ? user.profile_picture : null;
    };

    const broadcastNewSong = (song) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'new_song',
                song: song
            }));
        }
    };

    const toggleLike = (songId, userId, username) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'toggle_like',
                song_id: songId,
                user_id: userId,
                username: username
            }));
        }
    };

    const isSongLikedByUser = (songId, username) => {
        const song = songs.find(s => s.id === songId);
        return song ? song.liked_by?.includes(username) : false;
    };

    const updateListeningStatus = (songId, username, isListening) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'listening_update',
                song_id: songId,
                username: username,
                is_listening: isListening
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
            broadcastNewSong,
            toggleLike,
            isSongLikedByUser,
            updateListeningStatus,
            uploadRoomId,
            setUploadRoomId,
            currentUser,
            setCurrentUser,
            notifications,
            setNotifications,
            connectToNotifications,
            sendNotification
        }}>
            {children}
        </MainContext.Provider>
    );
};
