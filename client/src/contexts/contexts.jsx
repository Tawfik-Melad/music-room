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
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectTimeout = useRef(null);

    const connectToRoom = (roomId, userId) => {
        // Clean up any existing connection
        if (wsRef.current) {
            console.log('🔄 Cleaning up existing room WebSocket connection');
            wsRef.current.close(1000, 'Reconnecting');
            wsRef.current = null;
        }

        try {
            console.log('🔄 Attempting to connect to room WebSocket...');
            wsRef.current = new WebSocket(`ws://localhost:8000/ws/roomSong/${roomId}/?user_id=${userId}`);

            wsRef.current.onopen = () => {
                console.log('🟢 Room WebSocket connected successfully');
                reconnectAttempts.current = 0;
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'song_update') {
                    setSongs(prevSongs => [...prevSongs, data.song]);
                } else if (data.type === 'song_deleted') {
                    setSongs(prevSongs => prevSongs.filter(song => song.id !== data.song_id));
                    
                    if (currentSong?.id === data.song_id) {
                        setCurrentSong(null);
                        setIsPlaying(false);
                        localStorage.removeItem(`song_${data.song_id}`);
                    }
                } else if (data.type === 'like_update') {
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

                        if (currentSong && currentSong.id === data.song_id) {
                            const updatedSong = updatedSongs.find(s => s.id === data.song_id);
                            setCurrentSong(updatedSong);
                        }

                        return updatedSongs;
                    });
                } else if (data.type === 'listening_update') {
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

                        if (currentSong && currentSong.id === data.song_id) {
                            const updatedSong = updatedSongs.find(s => s.id === data.song_id);
                            setCurrentSong(updatedSong);
                        }

                        return updatedSongs;
                    });
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('🔴 Room WebSocket closed:', event.code, event.reason);
                
                if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current += 1;
                    console.log(`Attempting to reconnect room WebSocket (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
                    reconnectTimeout.current = setTimeout(() => connectToRoom(roomId, userId), 2000 * reconnectAttempts.current);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('⚠️ Room WebSocket Error:', error);
            };
        } catch (error) {
            console.error('⚠️ Error creating room WebSocket:', error);
        }
    };

    const connectToNotifications = (roomId) => {
        // Clean up any existing connection
        if (notificationWsRef.current) {
            console.log('🔄 Cleaning up existing notification WebSocket connection');
            notificationWsRef.current.close(1000, 'Reconnecting');
            notificationWsRef.current = null;
        }

        try {
            console.log('🔄 Attempting to connect to notification WebSocket...');
            notificationWsRef.current = new WebSocket(`ws://localhost:8000/ws/notifications/${roomId}/`);

            notificationWsRef.current.onopen = () => {
                console.log('🟢 Notification WebSocket connected successfully');
                reconnectAttempts.current = 0;
            };

            notificationWsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setNotifications(prevNotifications => [...prevNotifications,
                { message: data.message, username: data.username, action: data.action }]);
            };

            notificationWsRef.current.onclose = (event) => {
                console.log('🔴 Notification WebSocket closed:', event.code, event.reason);
                
                if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current += 1;
                    console.log(`Attempting to reconnect notification WebSocket (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
                    reconnectTimeout.current = setTimeout(() => connectToNotifications(roomId), 2000 * reconnectAttempts.current);
                }
            };

            notificationWsRef.current.onerror = (error) => {
                console.error('⚠️ Notification WebSocket Error:', error);
            };
        } catch (error) {
            console.error('⚠️ Error creating notification WebSocket:', error);
        }
    };

    const sendNotification = (message, username, action) => {
        if (notificationWsRef.current && notificationWsRef.current.readyState === WebSocket.OPEN) {
            console.log("Sending notification", message, username, action);
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
            wsRef.current.close(1000, 'Clearing data');
            wsRef.current = null;
        }
        
        if (notificationWsRef.current) {
            notificationWsRef.current.close(1000, 'Clearing data');
            notificationWsRef.current = null;
        }

        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
        }
        
        reconnectAttempts.current = 0;
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

    const broadcastDeleteSong = (songId) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'delete_song',
                song_id: songId
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
            }
            if (notificationWsRef.current) {
                notificationWsRef.current.close(1000, 'Component unmounting');
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, []);

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
            broadcastDeleteSong,
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
