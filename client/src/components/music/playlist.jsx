import { useContext, useEffect } from "react";
import request from "../../pre-request";
import { MainContext } from "../../contexts/contexts";
import "./styles/playList.css";
import Uploading from "./upload";

const Playlist = ({ roomCode , user }) => {
    const { songs, setSongs, setCurrentSong, setIsPlaying,
        getProfilePicture, currentSong, isSongLikedByUser,
        updateListeningStatus,isUserActive } = useContext(MainContext);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const response = await request.get(`/api/music-rooms/${roomCode}/songs/`);
            console.log("response.data", response.data);
            setSongs(response.data);
        } catch (error) {
            console.error("Failed to fetch songs");
        }
    };

    const handleSongSelect = (song) => {
        // Update listening status for the previous song if it exists
        if (currentSong) {
            updateListeningStatus(currentSong.id, user.username, false);
        }
        
        // Update listening status for the new song
        updateListeningStatus(song.id, user.username, true);
        
        setCurrentSong(song);
        setIsPlaying(true);
    };

    return (
        <>
            <div className="playlist-container">
                <div className="songs-list">
                    {songs.length === 0 ? (
                        <div className="empty-playlist">
                            <div className="empty-illustration">
                                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#f2a03d" strokeWidth="1.5">
                                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className="music-waves"/>
                                    <circle cx="12" cy="12" r="10" 
                                        strokeDasharray="4 4"
                                        className="pulse-circle"/>
                                </svg>
                            </div>
                            <h3>No Songs Yet</h3>
                            <p>Be the first to add some music to this playlist!</p>
                            <p className="empty-tip">Use the upload button below to add your favorite tracks 🎵</p>
                        </div>
                    ) : (
                        songs.map((song) => (
                            <div 
                                key={song.id} 
                                className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                                onClick={() => handleSongSelect(song)}
                            >
                                <div className="song-cover">
                                    <img 
                                        src={song.info?.cover_picture || "/static/defult.png"} 
                                        alt="Cover" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/static/defult.png";
                                        }}
                                    />
                                    <div className="user-avatar">
                                        <img src={getProfilePicture(song.uploaded_by)} alt="Profile" />
                                    </div>
                                </div>
                                <div className="song-info">
                                    {song.listening_users?.length > 0 && (
                                        <div className="listening-users">
                                            <span className="listening-icon">
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                                </svg>
                                            </span>                                            {song.listening_users.slice(0, 3).map((user, index) => (
                                                <div key={index} className="listening-user-avatar">
                                                    <img src={getProfilePicture(user)} alt="Profile" />
                                                </div>
                                            ))}
                                            {song.listening_users.length > 3 && (
                                                <span className="more-listeners">
                                                    +{song.listening_users.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <p className="song-title">{song.info?.title || "Unknown Title"}</p>
                                    <p className="song-uploader">Added by {song.uploaded_by}</p>
                                    <div className="song-stats">
                                        <div className="liked-users">
                                            {song.liked_by?.slice(0, 5).map((user, index) => (
                                                <div key={index} className="liked-user-avatar">
                                                    <img src={getProfilePicture(user)} alt="Profile" />
                                                    <div className="heart-overlay">
                                                        <svg viewBox="0 0 24 24" width="10" height="10" fill="#ff4b4b">
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                            {song.liked_by?.length > 5 && (
                                                <div className="more-likes">
                                                    +{song.liked_by.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <Uploading roomCode={roomCode} user={user} />
                </div>
            </div>
        </>
    );
};

export default Playlist;
