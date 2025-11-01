import React, { useState, useEffect } from 'react';
import { Paper, Box, TextField, IconButton, Typography, Button, Avatar, Skeleton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NorthEastIcon from '@mui/icons-material/NorthEast';

interface Message {
  text: string;
  isBot: boolean;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(
    [
      {
        text: "Hi! I'm your AI assistant. I can help explain the analysis results, answer questions about the startup evaluation, or provide insights about specific scores. What would you like to know?",
        isBot: true,
      },
    ]
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, isBot: false }]);
    setInput('');
    // Add your AI response logic here
  };

  const quickReplies = ['Should I invest?'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Your existing fetch calls here
        // ...
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 360,
        height: 480,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #2D1B69 0%, #1a1040 100%)',
        borderRadius: 3,
      }}
      elevation={3}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6">AI Assistant</Typography>
        </Box>
        <Box>
          <IconButton size="small" sx={{ color: 'white' }}>
            <NorthEastIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '6px',
          },
          // Add padding bottom to prevent overlap with input
          pb: 4
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              flexDirection: message.isBot ? 'row' : 'row-reverse',
              width: '100%',
            }}
          >
            {message.isBot && (
              <Avatar
                sx={{
                  bgcolor: '#B174FF',
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  mt: 0.5
                }}
              >
                <SmartToyIcon sx={{ fontSize: 20 }} />
              </Avatar>
            )}
            <Paper
              sx={{
                p: 1.5,
                bgcolor: message.isBot ? '#ffffff1a' : '#B174FF',
                color: 'white',
                borderRadius: 2,
                maxWidth: message.isBot ? '85%' : '75%',
                width: 'fit-content'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {message.text}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', mb: 1 }}>
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              variant="contained"
              size="small"
              onClick={() => {
                setInput(reply);
                handleSend();
              }}
              sx={{
                bgcolor: '#B174FF',
                '&:hover': {
                  bgcolor: '#9656d6',
                },
                fontSize: '0.8rem',
                py: 0.5
              }}
            >
              {reply}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Input Area */}
      <Box 
        sx={{ 
          p: 2, 
          pt: 1,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            bgcolor: '#ffffff1a',
            borderRadius: 2,
            p: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'transparent',
                color: 'white',
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{ color: 'white' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Your existing fetch calls here
        // ...
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    // ...existing return code...
  );
}