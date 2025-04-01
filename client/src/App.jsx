import { useState } from 'react'
import { BrowserRouter, Route, Routes ,Navigate} from 'react-router-dom'
import './App.css'
import Home  from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Room from './pages/room'
import ProtectedRoute from './components/common/protected-route'
import { MainProvider } from './contexts/contexts'

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
      <MainProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </MainProvider>
  )
}

export default App
