# 🎧 Rhythm — Let’s Listen Together

**Rhythm** is a full-stack music-sharing platform that allows users to create rooms, upload songs, and listen together in real-time. With live chat, reactions, and notifications, it’s built with ❤️ to make sharing music more meaningful and connected. 

---

### 🌟 Why This Project?

Have you ever wanted to share a song with someone and see their reaction in real-time as they listen? Text is great, but music hits deeper. This app was born out of the desire to make online interactions more emotional and genuine. Music is a universal language that can connect people like nothing else.
---
### 📸 Demo

🎬 [Watch Demo on YouTube](https://www.youtube.com/watch?v=rTkOlnB8X5o)

---
---

### 🌐 Live Demo
🚀 Coming soon... Stay tuned for a live demo link!

---

### 🚀 Key Features

- **🔐 Secure Authentication**: Login with JWT (JSON Web Tokens) for a seamless and secure user experience.
  
- **🔊 Real-Time Listening Rooms**: Join rooms using a room code or create your own. Share music and vibe together.

- **🎵 Upload & Stream Songs**: Add your favorite tracks to the room for everyone to listen to.

- **📡 Real-Time Synchronization**: Everyone listens to the same song, at the same time, in perfect sync.

- **🧑‍🤝‍🧑 Multi-User Support**: Multiple users can join the same room, chat, and interact while enjoying music.

- **❤️ Like Songs**: Show love for songs with the heart button — everyone in the room gets notified.

- **💬 Live Chat**: Talk about the music as it plays. Let’s discuss, share thoughts, and vibe together!

- **🟢🟠 User Presence**: Instantly see who’s online or offline in your room.

- **👑 Room Host**: The room creator is the host and has special privileges.

- **🔔 Notifications**: Get notified when people join/leave, when songs are liked, and when events happen.

- **📀 Spotify API Integration**: Automatically fetch artist information and cover images when you upload songs.

- **🧠 Memory Optimization**: Empty rooms are automatically deleted to prevent memory leaks and improve performance.

- **📱 Fully Responsive UI/UX**: A smooth, modern interface optimized for any device.

- **👤 User Profiles**: Customize your profile and revisit previous rooms.

---

### ⚙️ Tech Stack

![Django](https://img.shields.io/badge/Backend-Django-092E20?style=flat&logo=django)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue)
![Daphne](https://img.shields.io/badge/Realtime-Daphne-orange)
![Bootstrap](https://img.shields.io/badge/UI-Bootstrap-purple)

#### 🔥 Frontend
- ReactJS + Vite for a lightning-fast frontend.
- Socket.IO Client for seamless real-time updates.
- Bootstrap for a sleek, responsive design (no Tailwind).
- Custom notification system for real-time alerts.

#### ⚙️ Backend
- Django Rest Framework for a powerful, flexible backend.
- JWT Authentication (SimpleJWT) for secure logins.
- Django Channels + Daphne for real-time communication.
- SQLite for lightweight database development.
- Spotify API integration for automatic fetching of music metadata.

---

### 🧭 User Journey

1. **Create an Account** or **Login** using JWT authentication.
2. **Create a Room** or **Join an Existing Room** by entering a room code.
3. **Upload Songs** and let everyone enjoy music together.
4. **Listen in Sync** — everyone hears the same song, at the same time.
5. **Chat and React** — discuss songs, share your thoughts, and see your friends' reactions.
6. **Check Profiles** and revisit your previous rooms for a more personalized experience.

---



### 🗃️ Future Plans

- **📝 User Playlists**: Create and manage your personal music library.
- **🌍 Public & Private Rooms**: Choose whether to share your room with everyone or keep it private.
- **📱 Native Mobile Version**: A React Native app to extend the experience to mobile devices.
- **🎙️ Music Reactions with Emojis**: React to songs with fun emoji reactions.
- **📊 User Data Analysis**: Get insights into your musical tastes, listening history, and preferences.

---

### 🤝 Contribution

Feel free to contribute! If you have ideas or suggestions, open an issue or submit a pull request. If you love the project, please ⭐ star it and share it with others!

---

### 📜 License

MIT License — Free to use, remix, and improve. See the LICENSE file for more details.

---

### 📥 Getting Started

Clone the repository and set up the app locally:

```bash
# Clone the repo
git clone https://github.com/your-username/rhythm-app.git
cd rhythm-app

# Set up the backend
cd backend
python -m venv env
source env/bin/activate  # For macOS/Linux
# OR
env\Scripts\activate  # For Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Run Daphne for WebSocket support
daphne backend.asgi:application

# Set up the frontend
cd ../client
npm install
npm run dev
