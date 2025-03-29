import { useContext, useEffect } from 'react';
import { MusicContext } from '../context/MusicContext';

const Song = () => {
    const { currentSong, audioRef, setIsPlaying } = useContext(MusicContext);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            const audioUrl = currentSong.file.startsWith('http') 
                ? currentSong.file 
                : `http://localhost:8000${currentSong.file}`;
                
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            audioRef.current.play().catch(() => setIsPlaying(false));
        }
    }, [currentSong]);

    return currentSong ? (
        <div className="current-song">
            <p>Now Playing: {currentSong.info?.title || 'Unknown'}</p>
        </div>
    ) : <p>No song playing</p>;
};

export default Song;
