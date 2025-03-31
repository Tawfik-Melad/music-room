import { useContext, useRef } from 'react';
import { MusicContext } from '../context/MusicContext';
import request from '../../../pre-request';

const Uploading = ({ roomCode }) => {
    const { setSongs, setCurrentSong, setIsPlaying, setUploadError } = useContext(MusicContext);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            setUploadError('Please select an audio file');
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            setUploadError('File size should be less than 16MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('info', JSON.stringify({ title: file.name, artist: 'Unknown' }));

        try {
            const response = await request.post(`/api/music-rooms/${roomCode}/songs/`, formData);
            setSongs(prev => [...prev, response.data]);
            setCurrentSong(response.data);
            setIsPlaying(true); 
        } catch (error) {
            setUploadError('Failed to upload song');
        } finally {
            event.target.value = '';
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                id="file-upload"
            />
            <label htmlFor="file-upload">
                Upload Song
            </label>
        </div>
    );
};

export default Uploading;
