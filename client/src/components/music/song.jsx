import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../contexts/contexts";
import { FaPlay, FaPause, FaForward, FaBackward, FaHeart, FaVolumeUp, FaVolumeMute } from "react-icons/fa"; // Icons
import "./styles/song.css";

const Song = ({roomCode, user}) => {
    const { currentSong, setCurrentSong, setIsPlaying,
        playNextSong, getProfilePicture, toggleLike, isSongLikedByUser, sendNotification } = useContext(MainContext);
    const audioRef = useRef(null);
    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [loved, setLoved] = useState(isSongLikedByUser(currentSong?.id, user.username));

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.src = currentSong.file;
            audioRef.current.load();
            audioRef.current.play().then(() => {
                setPlaying(true);
                setIsPlaying(true);
            }).catch(error => {
                console.error("Error playing audio:", error);
            });
        }
    }, [currentSong]);

    // Update loved state whenever currentSong changes
    useEffect(() => {
        if (currentSong?.id) {
            setLoved(isSongLikedByUser(currentSong.id, user.username));
        }
    }, [currentSong, user.username]);

    const togglePlay = () => {
        if (audioRef.current.paused) {
            audioRef.current.play();
            setPlaying(true);
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setPlaying(false);
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        const newTime = e.target.value;
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            audioRef.current.volume = volume;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    const updateProgress = () => {
        setProgress(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleLove = () => {
        toggleLike(currentSong.id, user.id, user.username);
        setLoved(!loved);
        if(!loved){
            sendNotification(`${user.username} has loved ${currentSong.info?.title}`, user.username,"like" );
        }
        // You can send this reaction to the backend if needed
    };

    const handleSongEnd = () => {
        playNextSong(); // Automatically play the next song
    };

    // Calculate progress percentage for CSS variable
    const progressPercent = duration ? (progress / duration) * 100 : 0;
    const volumePercent = volume * 100;

    return (
        <div className="now-playing">
            <audio 
                ref={audioRef} 
                onTimeUpdate={updateProgress} 
                onEnded={handleSongEnd}
                onLoadedMetadata={updateProgress}
            />
            {currentSong ? (
                <div className="song-details">
                    {/* Song Cover + Uploader */}
                    <div className="song-cover">
                        <img 
                            src={currentSong.info?.cover_picture || "/static/defult.png"} 
                            alt="Cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/static/defult.png";
                            }}
                        />
                        <div className="uploader-avatar">
                            <img src={getProfilePicture(currentSong.uploaded_by)} alt="Uploader" />
                        </div>
                    </div>

                    {/* Song Info */}
                    <div className="song-meta">
                        <h3>{currentSong.info?.title || "Unknown Title"}</h3>
                        <p className="artist">{currentSong.info?.artist || "Unknown Artist"}</p>
                        <p className="uploader">Uploaded by {currentSong.uploaded_by}</p>

                        {/* Progress Bar with Time Display */}
                        <div className="progress-container">
                            <input
                                type="range"
                                value={progress}
                                max={duration || 100}
                                onChange={handleSeek}
                                className="progress-bar"
                                style={{ "--progress-percent": `${progressPercent}%` }}
                            />
                            <div className="time-display">
                                <span>{formatTime(progress)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls Section */}
                        <div className="controls-section">
                            <div className="controls">
                                <button className="control-btn" onClick={() => playNextSong('prev')}><FaBackward /></button>
                                <button className="play-btn" onClick={togglePlay}>
                                    {isPlaying ? <FaPause /> : <FaPlay />}
                                </button>
                                <button className="control-btn" onClick={() => playNextSong('next')}><FaForward /></button>
                            </div>

                            {/* Volume Control */}
                            <div className="volume-control">
                                <button className="volume-icon" onClick={toggleMute}>
                                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                                <div className="volume-slider-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="volume-slider"
                                        style={{ "--volume-percent": `${isMuted ? 0 : volumePercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Love Button - Right Aligned */}
                    <button className={`love-btn ${loved ? "loved" : ""}`} onClick={handleLove}>
                        <FaHeart />
                    </button>
                </div>
            ) : (
                <div className="empty-state">
                    <p>No song playing</p>
                </div>
            )}
        </div>
    );
};

export default Song;
