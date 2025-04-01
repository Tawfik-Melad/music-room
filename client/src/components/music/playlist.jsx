import { useContext, useEffect } from "react";
import request from "../../pre-request";
import { MainContext } from "../../contexts/contexts";
import "./styles/playList.css";
import Uploading from "./upload";

const Playlist = ({ roomCode }) => {
    const { songs, setSongs, setCurrentSong, setIsPlaying, getProfilePicture, currentSong } = useContext(MainContext);

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
        console.log("song", song);
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
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = "/static/defult.png";
                                        }}
                                    />
                                    <div className="user-avatar">
                                        <img src={getProfilePicture(song.uploaded_by)} alt="Profile" />
                                    </div>
                                </div>
                                <div className="song-info">
                                    <p className="song-title">{song.info?.title || "Unknown Title"}</p>
                                    <p className="song-uploader">Added by {song.uploaded_by}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <Uploading roomCode={roomCode} />
                </div>
            </div>
        </>
    );
};

export default Playlist;
