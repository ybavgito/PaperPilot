import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Send as SendIcon, Share as ShareIcon } from '@mui/icons-material';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import SearchFilters from './SearchFilters';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

interface Paper {
  title: string;
  authors: string[];
  summary: string;
  pdf_url: string;
  published: string;
  updated: string | null;
  arxiv_id: string;
  categories: string[];
  comment: string | null;
  journal_ref: string | null;
  doi: string | null;
}

const API_BASE_URL = 'http://localhost:8001';

const ChatInterface: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createNewChat = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chats`, { is_public: isPublic });
      navigate(`/chat/${response.data.chat_id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  }, [isPublic, navigate]);

  const fetchChatHistory = useCallback(async () => {
    if (!chatId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${chatId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    } else {
      createNewChat();
    }
  }, [chatId, createNewChat, fetchChatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;

    const userMessage: Message = { content: input, role: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // First, save the user message
      await axios.post(`${API_BASE_URL}/chats/${chatId}/messages`, userMessage);

      // Then, search for papers with filters
      const searchResponse = await axios.get(`${API_BASE_URL}/search`, {
        params: {
          query: input,
          ...searchFilters
        }
      });

      const papers: Paper[] = searchResponse.data.papers;
      const assistantMessage: Message = {
        content: formatPaperResults(papers),
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
      await axios.post(`${API_BASE_URL}/chats/${chatId}/messages`, assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatPaperResults = (papers: Paper[]) => {
    return papers.map(paper => {
      let result = `- ${paper.title}\n`;
      result += `  Authors: ${paper.authors.join(', ')}\n`;
      result += `  Categories: ${paper.categories.join(', ')}\n`;
      result += `  Published: ${new Date(paper.published).toLocaleDateString()}\n`;
      if (paper.updated) {
        result += `  Updated: ${new Date(paper.updated).toLocaleDateString()}\n`;
      }
      if (paper.doi) {
        result += `  DOI: ${paper.doi}\n`;
      }
      if (paper.journal_ref) {
        result += `  Journal Reference: ${paper.journal_ref}\n`;
      }
      result += `  arXiv ID: ${paper.arxiv_id}\n`;
      result += `  PDF: ${paper.pdf_url}\n`;
      result += `  Summary: ${paper.summary}\n`;
      if (paper.comment) {
        result += `  Comment: ${paper.comment}\n`;
      }
      return result;
    }).join('\n');
  };

  const handleShare = async () => {
    if (!chatId) return;
    try {
      await axios.post(`${API_BASE_URL}/chats/${chatId}`, { is_public: true });
      setIsPublic(true);
      // You can add a share URL copy functionality here
    } catch (error) {
      console.error('Error sharing chat:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    return (
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: '70%',
            bgcolor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'white' : 'text.primary',
          }}
        >
          <Typography variant="body1">
            {message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        </Paper>
      </ListItem>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">ML Paper Search</Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={!!chatId}
              />
            }
            label="Public Chat"
          />
          {chatId && (
            <IconButton onClick={handleShare} color="primary">
              <ShareIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <SearchFilters onFiltersChange={setSearchFilters} />

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {renderMessage(message)}
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about ML papers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface; 