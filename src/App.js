import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Events from './components/Events';
import Tickets from './components/Tickets';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import { Box, Alert } from '@mui/material';

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleNetworkChange = () => {
    const onlineStatus = navigator.onLine;
    setIsOnline(onlineStatus);
    // Persist network status in localStorage to sync across tabs
    localStorage.setItem('isOnline', onlineStatus);
  };

  useEffect(() => {
    // Check if there's a saved network status in localStorage
    const savedStatus = localStorage.getItem('isOnline');
    if (savedStatus !== null) {
      setIsOnline(JSON.parse(savedStatus));
    }

    // Add event listeners for online and offline events
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, paddingTop: 8 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Box>

        {/* Fixed Alert Banner for No Internet */}
        {!isOnline && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <Alert severity="error" sx={{ width: '100%', borderRadius: 0 }}>
              No internet connection. Some features may not work. Please reconnect.
            </Alert>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
