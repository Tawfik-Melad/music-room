import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';

const ControlBar = () => {
    const { isPlaying, setIsPlaying, audioRef } = useContext(MusicContext);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div>
            <button onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};

export default ControlBar;
