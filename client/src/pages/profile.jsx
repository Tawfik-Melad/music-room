import React, { useState, useContext, useRef } from 'react';
import { MainContext } from '../contexts/contexts';
import { FaCamera, FaMusic, FaUsers, FaHeart, FaClock } from 'react-icons/fa';
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
    const fileInputRef = useRef(null);

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
                } else {
                    console.error('Error updating profile picture:', data.message);
                }
            } else {
                const errorData = await response.json();
                console.error('Error updating profile picture:', errorData.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
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
                    
                </div>

                <div className="profile-page-stats-section">
                    <div className="profile-page-stat-card">
                        <FaMusic className="profile-page-stat-icon" />
                        <div className="profile-page-stat-info">
                            <h3>Recent Rooms</h3>
                            <p>Last joined: Room #1234</p>
                        </div>
                    </div>
                    <div className="profile-page-stat-card">
                        <FaUsers className="profile-page-stat-icon" />
                        <div className="profile-page-stat-info">
                            <h3>Friends</h3>
                            <p>12 active friends</p>
                        </div>
                    </div>
                    <div className="profile-page-stat-card">
                        <FaHeart className="profile-page-stat-icon" />
                        <div className="profile-page-stat-info">
                            <h3>Likes</h3>
                            <p>45 songs liked</p>
                        </div>
                    </div>
                    <div className="profile-page-stat-card">
                        <FaClock className="profile-page-stat-icon" />
                        <div className="profile-page-stat-info">
                            <h3>Listening Time</h3>
                            <p>12 hours this week</p>
                        </div>
                    </div>
                </div>
            </div>
            </div>
         </div>
    );
};

export default Profile; 