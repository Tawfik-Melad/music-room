import { useContext, useEffect } from 'react';
import { Context } from '../../../contexts/contexts';
import request from '../../../pre-request';

const Playlist = ({ roomCode }) => {
    const { songs, setSongs, setCurrentSong, setIsPlaying, getProfilePicture } = useContext(Context);
    
    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const response = await request.get(`/api/music-rooms/${roomCode}/songs/`);
            console.log("response.data",response.data);
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
        <div className="playlist-container">
            {songs.map(song => (
                <div key={song.id} className="song-item" onClick={() => handleSongSelect(song)}>
                    <div className="song-cover">
                        <img src="/defult.png" alt="Cover" />
                        <div className="user-avatar">
                            <img src={getProfilePicture(song.uploaded_by)} alt="Profile" />
                        </div>
                    </div>
                    <div className="song-info">
                        <p className="song-title">{song.info?.title || 'Unknown Title'}</p>
                        <p className="song-uploader">Added by {song.uploaded_by}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Playlist; 