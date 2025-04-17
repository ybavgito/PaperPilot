import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import axios from 'axios';

interface PublicChat {
  chat_id: string;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

const PublicChats: React.FC = () => {
  const [chats, setChats] = useState<PublicChat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicChats();
  }, []);

  const fetchPublicChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/public`);
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error fetching public chats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Public Chats
      </Typography>
      <Paper elevation={3}>
        <List>
          {chats.map((chat, index) => (
            <React.Fragment key={chat.chat_id}>
              <ListItem
                button
                onClick={() => navigate(`/chat/${chat.chat_id}`)}
              >
                <ListItemText
                  primary={`Chat ${chat.chat_id.slice(0, 8)}...`}
                  secondary={`Created: ${formatDate(chat.created_at)}`}
                />
              </ListItem>
              {index < chats.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {chats.length === 0 && (
            <ListItem>
              <ListItemText primary="No public chats available" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default PublicChats; 