import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../contexts/contexts";
import { FaPlay, FaPause, FaForward, FaBackward, FaHeart } from "react-icons/fa"; // Icons
import "./styles/song.css";

const Song = () => {
    const { currentSong, setIsPlaying, playNextSong } = useContext(MainContext);
    const audioRef = useRef(null);
    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loved, setLoved] = useState(false);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.src = currentSong.file;
            audioRef.current.load();
            setPlaying(false);
        }
    }, [currentSong]);

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

    const updateProgress = () => {
        setProgress(audioRef.current.currentTime);
    };

    const handleLove = () => {
        setLoved(!loved);
        // You can send this reaction to the backend if needed
    };

    const handleSongEnd = () => {
        playNextSong(); // Automatically play the next song
    };

    return (
        <div className="now-playing">
            <audio ref={audioRef} onTimeUpdate={updateProgress} onEnded={handleSongEnd} />
            {currentSong ? (
                <div className="song-details">
                    {/* Song Cover + Uploader */}
                    <div className="song-cover">
                        <img src={currentSong.info?.cover || "/default-song.png"} alt="Cover" />
                        <div className="uploader-avatar">
                            <img src={currentSong.uploaded_by_photo || "/default-avatar.png"} alt="Uploader" />
                        </div>
                    </div>

                    {/* Song Info */}
                    <div className="song-meta">
                        <h3>{currentSong.info?.title || "Unknown Title"}</h3>
                        <p className="artist">{currentSong.info?.artist || "Unknown Artist"}</p>
                        <p className="uploader">Uploaded by {currentSong.uploaded_by}</p>

                        {/* Progress Bar */}
                        <input
                            type="range"
                            value={progress}
                            max={audioRef.current?.duration || 100}
                            onChange={handleSeek}
                            className="progress-bar"
                        />

                        {/* Controls - Centered */}
                        <div className="controls">
                            <button className="control-btn"><FaBackward /></button>
                            <button className="play-btn" onClick={togglePlay}>
                                {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>
                            <button className="control-btn"><FaForward /></button>
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
