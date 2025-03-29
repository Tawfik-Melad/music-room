import { useEffect, useState } from 'react';
import { MusicProvider } from './context/MusicContext';
import Uploading from './components/upload';
import Playlist from './components/playlist';
import Song from './components/song';
import ControlBar from './components/control-bar';
import './music.css';
import request from '../../pre-request';

const Main = ({ roomCode }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const createUploadRoom = async () => {
        try {
            await request.post(`/api/music-rooms/${roomCode}/`);
            setLoading(false); // Data fetched, stop loading
        } catch (error) {
            console.error('Error creating upload room:', error);
            setError('Failed to create upload room.');
            setLoading(false); // Even on error, stop loading
        }
    };

    useEffect(() => {
        createUploadRoom(); 
    }, [roomCode]);

    // Show loading or error message
    if (loading) {
        return <p className="loading-message">Loading Music Room...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    // Render the components only after loading is complete
    return (
        <MusicProvider>
            <div className="music-container">
                <h2>Music Room</h2>
                <Uploading roomCode={roomCode} />
                <Playlist roomCode={roomCode} />
                <Song />
                <ControlBar />
            </div>
        </MusicProvider>
    );
};

export default Main;
