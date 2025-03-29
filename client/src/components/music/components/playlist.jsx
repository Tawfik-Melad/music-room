import { useContext, useEffect } from 'react';
import { MusicContext } from '../context/MusicContext';
import request from '../../../pre-request';

const Playlist = ({ roomCode }) => {
    const { songs, setSongs, setCurrentSong, setIsPlaying } = useContext(MusicContext);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const response = await request.get(`/api/music-rooms/${roomCode}/songs/`);
            setSongs(response.data);
        } catch (error) {
            console.error('Failed to fetch songs');
        }
    };

    const handleSongSelect = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
    };

    return (
        <div className="song-list">
            {songs.map(song => (
                <div key={song.id} className="song-item" onClick={() => handleSongSelect(song)}>
                    <p>{song.info?.title || 'Unknown Title'}</p>
                </div>
            ))}
        </div>
    );
};

export default Playlist;
