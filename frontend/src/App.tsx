import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import ChatInterface from './components/ChatInterface';
import PublicChats from './components/PublicChats';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1976d2' : '#90caf9',
          },
          secondary: {
            main: mode === 'light' ? '#dc004e' : '#f48fb1',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ML Paper Search Engine
              </Typography>
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
            <Routes>
              <Route path="/" element={<ChatInterface />} />
              <Route path="/chat/:chatId" element={<ChatInterface />} />
              <Route path="/public" element={<PublicChats />} />
            </Routes>
          </Container>

          <Box
            component="footer"
            sx={{
              py: 2,
              px: 2,
              mt: 'auto',
              backgroundColor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              Built with FastAPI, React, and ArXiv API
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 