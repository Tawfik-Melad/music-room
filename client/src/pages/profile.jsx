import React, { useState, useContext, useRef, useEffect } from 'react';
import { MainContext } from '../contexts/contexts';
import { FaCamera, FaUsers, FaClock } from 'react-icons/fa';
import Navbar from '../components/common/navbar';
import request from '../pre-request';
import { ACCESS_TOKEN } from '../constants';
import '../styles/profile.css';

const Profile = () => {
    const { currentUser, setCurrentUser } = useContext(MainContext);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [joinedRooms, setJoinedRooms] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchJoinedRooms = async () => {
            try {
                const response = await request.get('/room/active-user-rooms/');
                console.log('Joined rooms:', response.data);
                setJoinedRooms(response.data);
            } catch (error) {
                console.error('Error fetching joined rooms:', error);
            }
        };

        fetchJoinedRooms();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!profileImage) return;

        const formData = new FormData();
        formData.append('profile_picture', profileImage);

        try {
            const response = await fetch('http://localhost:8000/accounts/update-profile-picture/', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setCurrentUser(prev => ({
                        ...prev,
                        profile_picture: data.profile_picture
                    }));
                    setPreviewImage(null);
                    setProfileImage(null);
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        
        // Set both dates to start of day for accurate comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffTime = Math.abs(today - compareDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div>  
            <Navbar user={currentUser}/>
            <div className="profile-page-container">
                <div className="profile-page-header">
                    <div className="profile-page-image-container">
                        <img 
                            src={currentUser?.profile_picture || '/default-avatar.png'} 
                            alt="Profile" 
                            className="profile-page-image"
                        />
                        <div className="image-upload-overlay">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <button 
                                className="upload-button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FaCamera />
                            </button>
                        </div>
                    </div>
                    {previewImage && (
                        <button className="save-image-button" onClick={handleImageUpload}>
                            Save New Image
                        </button>
                    )}
                </div>

                <div className="profile-page-content">
                    <div className="profile-page-username-section">
                        <div className="profile-page-username-display">
                            <h1>{currentUser?.username}</h1>
                        </div>
                        <div className="account-info">
                            <p className="join-date">
                                <FaClock className="clock-icon" />
                                Member since {formatDate(currentUser?.joined_at)}
                            </p>
                        </div>
                    </div>

                    <div className="joined-rooms-section">
                        <h2>Your friends waiting you</h2>
                        <div className="rooms-grid">
                            {joinedRooms.map((room) => (
                                <div key={`${room.room}-${room.user}`} className="room-card">
                                    <div className="room-card-header">
                                        <FaUsers className="room-icon" />
                                        <span className="room-code">{room.room} <span className="room-host">Host: {room.user}</span></span>
                                    </div>
                                    <div className="room-card-content">
                                        <p className="room-join-date">
                                            <FaClock className="clock-icon" />
                                            Joined {formatDate(room.joined_at)}
                                        </p>
                                        <p className="room-status">
                                            Status: {room.connected ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 