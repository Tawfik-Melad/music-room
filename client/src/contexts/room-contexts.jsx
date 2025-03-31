import { createContext, useState, useEffect } from 'react';

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [users, setUsers] = useState([]);

    return (
        <RoomContext.Provider value={{
            users,
            setUsers
        }}>
            {children}
        </RoomContext.Provider>
    );
};