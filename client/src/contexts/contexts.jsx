import { createContext, useState, useEffect, useRef } from 'react';

export const MainContext = createContext(null);

export const MainProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const audioRef = useRef(null);


    
    const isUserActive = (username) => {
        const user = users.find(user => user.username === username);
        return user ? user.status === 'online' : false;
    };
    
    const getProfilePicture = (username) => {
    const user = users.find(user => user.username === username);
    return user ? user.profile_picture : null; // Return the URL or null if not found
    };
    
    return (
        <MainContext.Provider value={{
            users,
            setUsers,
            isUserActive,
            getProfilePicture,
            songs,
            setSongs,
            currentSong,
            setCurrentSong,
            isPlaying,
            setIsPlaying,
            uploadError,
            audioRef
        }}>
            {children}
        </MainContext.Provider>
    );
};