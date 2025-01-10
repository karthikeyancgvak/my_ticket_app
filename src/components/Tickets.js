import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { openDB } from 'idb';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CardActionArea,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [db, setDb] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const database = await openDB('TicketsDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('tickets')) {
            db.createObjectStore('tickets', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
          }
        },
      });
      setDb(database);
    };
    initDB();
  }, []);

  // Fetch tickets from server or IndexedDB
  useEffect(() => {
    const fetchTickets = async () => {
      setIsSyncing(true);
      if (navigator.onLine) {
        try {
          const response = await axios.get('http://localhost:5000/tickets');
          setTickets(response.data);

          // Save to IndexedDB
          const tx = db.transaction('tickets', 'readwrite');
          const store = tx.objectStore('tickets');
          response.data.forEach((ticket) => store.put(ticket));
          await tx.done;
        } catch (error) {
          console.error('Error fetching tickets:', error);
        }
      } else {
        const tx = db.transaction('tickets', 'readonly');
        const store = tx.objectStore('tickets');
        const localTickets = await store.getAll();
        setTickets(localTickets);
      }
      setIsSyncing(false);
    };

    if (db) fetchTickets();
  }, [db]);

  // Handle status change
  const handleStatusChange = async (ticketId, newStatus) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    );
    setTickets(updatedTickets);

    if (navigator.onLine) {
      try {
        await axios.patch(`http://localhost:5000/tickets/${ticketId}`, { status: newStatus });
      } catch (error) {
        console.error('Error updating ticket status online:', error);
      }
    } else {
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      await store.put({ id: ticketId, status: newStatus });
    }

    const tx = db.transaction('tickets', 'readwrite');
    const store = tx.objectStore('tickets');
    await store.put({ id: ticketId, ...updatedTickets.find((t) => t.id === ticketId) });
  };

  // Sync offline changes when back online
  useEffect(() => {
    const syncChanges = async () => {
      const tx = db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const offlineUpdates = await store.getAll();

      for (const update of offlineUpdates) {
        try {
          await axios.patch(`http://localhost:5000/tickets/${update.id}`, { status: update.status });
          const deleteTx = db.transaction('syncQueue', 'readwrite');
          const deleteStore = deleteTx.objectStore('syncQueue');
          await deleteStore.delete(update.id);
        } catch (error) {
          console.error('Error syncing changes:', error);
        }
      }
    };

    if (navigator.onLine && db) {
      syncChanges().then(() => {
        // Re-fetch the latest tickets after syncing
        const fetchLatestTickets = async () => {
          try {
            const response = await axios.get('http://localhost:5000/tickets');
            setTickets(response.data);

            // Update IndexedDB with the latest data
            const tx = db.transaction('tickets', 'readwrite');
            const store = tx.objectStore('tickets');
            response.data.forEach((ticket) => store.put(ticket));
            await tx.done;
          } catch (error) {
            console.error('Error fetching latest tickets:', error);
          }
        };
        fetchLatestTickets();
      });
    }
  }, [db]);

  // Open Google Maps with ticket location
  const getDirections = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Customer Support Tickets
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage the customer issues and tickets here.
      </Typography>

      {isSyncing ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket) => (
            <Grid item xs={12} sm={6} md={4} key={ticket.id}>
              <Card sx={{ boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardActionArea sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {ticket.customerName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Issue: {ticket.issueType}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Date: {ticket.date}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Location: Lat {ticket.location.lat}, Lng {ticket.location.lng}
                    </Typography>

                    <Typography variant="body1" paragraph>
                      Description: {ticket.issueDescription}
                    </Typography>

                    <FormControl fullWidth variant="outlined" margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ marginTop: 2 }}
                      onClick={() => getDirections(ticket.location.lat, ticket.location.lng)}
                    >
                      Get Directions
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default Tickets;
