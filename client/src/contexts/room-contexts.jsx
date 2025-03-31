import { createContext, useState, useEffect } from 'react';

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const isUserActive = (username) => {
        const user = users.find(user => user.username === username);
        return user ? user.status === 'online' : false;
    };
    
    const getProfilePicture = (username) => {
    const user = users.find(user => user.username === username);
    return user ? user.profile_picture : null; // Return the URL or null if not found
    };
    
    return (
        <RoomContext.Provider value={{
            users,
            setUsers,
            isUserActive,
            getProfilePicture
        }}>
            {children}
        </RoomContext.Provider>
    );
};