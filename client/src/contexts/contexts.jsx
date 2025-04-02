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
            updateListeningStatus
        }}>
            {children}
        </MainContext.Provider>
    );
};
