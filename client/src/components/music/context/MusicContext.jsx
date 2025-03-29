import { createContext, useState, useRef } from 'react';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const audioRef = useRef(null);

    return (
        <MusicContext.Provider value={{
            songs,
            setSongs,
            currentSong,
            setCurrentSong,
            isPlaying,
            setIsPlaying,
            uploadError,
            setUploadError,
            audioRef
        }}>
            {children}
        </MusicContext.Provider>
    );
};
