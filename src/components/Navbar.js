import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, List, ListItem, ListItemText, ListItemIcon, Drawer, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import TicketIcon from '@mui/icons-material/ConfirmationNumber';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useMediaQuery } from '@mui/material';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const location = useLocation(); // Get current route

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Function to check if the link is active
  const isActiveLink = (path) => location.pathname === path;

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#b0b2b7' }}>
        <Toolbar>
          {/* Hamburger icon for mobile */}
          {isMobile && (
            <IconButton color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Network & Solutions
          </Typography>
          
          {/* Navbar Links for larger screens */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <Button
                component={Link}
                to="/"
                color={isActiveLink('/') ? 'secondary' : 'inherit'}
                startIcon={<HomeIcon />}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/events"
                color={isActiveLink('/events') ? 'secondary' : 'inherit'}
                startIcon={<EventIcon />}
              >
                Events
              </Button>
              <Button
                component={Link}
                to="/tickets"
                color={isActiveLink('/tickets') ? 'secondary' : 'inherit'}
                startIcon={<TicketIcon />}
              >
                Tickets
              </Button>
              <Button
                component={Link}
                to="/profile"
                color={isActiveLink('/profile') ? 'secondary' : 'inherit'}
                startIcon={<AccountCircleIcon />}
              >
                Profile
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
          },
        }}
      >
        <List>
          <ListItem button component={Link} to="/" onClick={handleDrawerToggle}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/events" onClick={handleDrawerToggle}>
            <ListItemIcon><EventIcon /></ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>
          <ListItem button component={Link} to="/tickets" onClick={handleDrawerToggle}>
            <ListItemIcon><TicketIcon /></ListItemIcon>
            <ListItemText primary="Tickets" />
          </ListItem>
          <ListItem button component={Link} to="/profile" onClick={handleDrawerToggle}>
            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
