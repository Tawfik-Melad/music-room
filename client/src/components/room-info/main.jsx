import React from 'react';
import { FaCrown } from 'react-icons/fa'; // Sexy crown for the host
import '../../styles/room-info.css'; // Import styles

const RoomInfo = ({ room }) => {
    if (!room) return null; // Handle case where room isn't loaded

    return (
        <div className="room-info">
            {/* Room Code */}
            <div className="room-code">
                <span>Room :</span>
                <strong>{room.code}</strong>
            </div>

            {/* Host Info */}
            <div className="room-host">
                <FaCrown className="host-icon" /> 
                <span className="host-name">{room.host.username}</span>
            </div>
        </div>
    );
};

export default RoomInfo;
