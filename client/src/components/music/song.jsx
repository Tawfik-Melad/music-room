import { useContext, useEffect, useRef } from 'react';
import { MainContext } from "../../contexts/contexts";

const Song = () => {
    const { currentSong, setIsPlaying } = useContext(MainContext);
    const audioRef = useRef(null);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            const audioUrl = currentSong.file.startsWith('http') 
                ? currentSong.file 
                : `http://localhost:8000${currentSong.file}`;
                
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            
            // Add event listeners for better control
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
            audioRef.current.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                setIsPlaying(false);
            });
            
            // Cleanup function
            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
                    audioRef.current.removeEventListener('error', () => setIsPlaying(false));
                }
            };
        }
    }, [currentSong, setIsPlaying]);

    return (
        <>
            <audio ref={audioRef} />
            {currentSong ? (
                <div>
                    <p>Now Playing: {currentSong.info?.title || 'Unknown'}</p>
                    <p>{currentSong.info?.artist || 'Unknown Artist'}</p>
                </div>
            ) : (
                <div>
                    <p>No song playing</p>
                </div>
            )}
        </>
    );
};

export default Song;
