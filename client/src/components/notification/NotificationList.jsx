import React, { useEffect, useState, useContext } from 'react';
import { MainContext } from '../../contexts/contexts';
import { FaHeart, FaMusic, FaDoorOpen, FaUserPlus, FaTrash } from 'react-icons/fa';
import './notifications-style.css';

const NotificationList = () => {
    const { notifications, getProfilePicture } = useContext(MainContext);
    const [currentNotification, setCurrentNotification] = useState(null);
    const [isFading, setIsFading] = useState(false);

    const getNotificationIcon = (action) => {
        switch (action) {
            case 'like':
                return <FaHeart />;
            case 'add_song':
                return <FaMusic />;
            case 'leave':
                return <FaDoorOpen />;
            case 'join':
                return <FaUserPlus />;
            case 'delete_song':
                return <FaTrash />;
            default:
                return <FaUserPlus />;
        }
    };

    useEffect(() => {
        if (notifications.length > 0) {
            const latestNotification = notifications[notifications.length - 1];
            setCurrentNotification(latestNotification);
            setIsFading(false);

            const timer = setTimeout(() => {
                setIsFading(true);
                setTimeout(() => {
                    setCurrentNotification(null);
                }, 500);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [notifications]);

    if (!currentNotification) return null;

    return (
        <div className="notification-container">
            <div className={`notification-item ${currentNotification.action} ${isFading ? 'fade-out' : ''}`}>
                <div className="notification-profile">
                    <img 
                        src={getProfilePicture(currentNotification.username) || '/default-avatar.png'} 
                        alt={currentNotification.username}
                    />
                    <div className="notification-action-icon">
                        {getNotificationIcon(currentNotification.action)}
                    </div>
                </div>
                <div className="notification-content">
                    <div className="notification-username">{currentNotification.username}</div>
                    <div className="notification-message">{currentNotification.message}</div>
                </div>
            </div>
        </div>
    );
};

export default NotificationList; 