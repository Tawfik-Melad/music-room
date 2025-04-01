import { useContext, useRef, useState } from 'react';
import { MainContext } from '../../contexts/contexts';
import request from '../../pre-request';
import './styles/upload.css';

const Uploading = ({ roomCode }) => {
    const { setSongs, setCurrentSong, setIsPlaying, setUploadError } = useContext(MainContext);
    const fileInputRef = useRef(null);
    const [uploadState, setUploadState] = useState('idle'); // idle, loading, success

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

        setUploadState('loading');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('info', JSON.stringify({ 
            title: file.name, 
            artist: 'Unknown',
            cover_picture: 'client/src/styles/ChatGPT Image Mar 30, 2025, 06_01_24 PM.png' 
        }));

        try {
            const response = await request.post(`/api/music-rooms/${roomCode}/songs/`, formData);
            setSongs(prev => [...prev, response.data]);
            setCurrentSong(response.data);
            setIsPlaying(true);
            setUploadState('success');
            setTimeout(() => setUploadState('idle'), 2000); // Reset after 2 seconds
        } catch (error) {
            setUploadError('Failed to upload song');
            setUploadState('idle');
        } finally {
            event.target.value = '';
        }
    };

    const getButtonText = () => {
        switch(uploadState) {
            case 'loading':
                return 'Uploading...';
            case 'success':
                return 'Song Added!';
            default:
                return 'Add Song';
        }
    };

    return (
        <div className={`upload-container ${uploadState !== 'idle' ? uploadState : ''}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                id="file-upload"
            />
            <label htmlFor="file-upload" className="upload-btn">
                <span className="upload-icon"></span>
            </label>
            <span className="upload-text">{getButtonText()}</span>
        </div>
    );
};

export default Uploading;
