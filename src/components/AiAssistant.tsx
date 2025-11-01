import React, { useState } from 'react';
import { Paper, Box, TextField, IconButton, Typography, Button, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NorthEastIcon from '@mui/icons-material/NorthEast';

interface Message {
  text: string;
  isBot: boolean;
}

export const AiAssistant: React.FC = () => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(
    [
      {
        text: "Hi! I'm your AI assistant. I can help explain the analysis results, answer questions about the startup evaluation, or provide insights about specific scores. What would you like to know?",
        isBot: true,
      },
    ]
  );
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, isBot: false }]);
    setInput('');
    // Add your AI response logic here
  };

  const quickReplies = ['Should I invest?'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        background: 'linear-gradient(180deg, #2D1B69 0%, #1F1346 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
          flexGrow: 1,
          height: 'calc(100% - 140px)', // Account for header and input area
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          px: 2,
          py: 1.5,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '6px',
          },
          maskImage: 'linear-gradient(to bottom, transparent, black 10px, black 90%, transparent)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 'min-content' }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              flexDirection: message.isBot ? 'row' : 'row-reverse',
              maxWidth: '100%',
              width: '100%',
              pr: message.isBot ? 1 : 0,
              pl: message.isBot ? 0 : 1,
              }}
            >
              {message.isBot && (
                <Avatar
                  sx={{
                    bgcolor: '#B174FF',
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: message.isBot ? 'rgba(255, 255, 255, 0.08)' : '#B174FF',
                  color: 'white',
                  borderRadius: message.isBot ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                  maxWidth: 'calc(100% - 40px)',
                  width: 'fit-content',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  hyphens: 'auto',
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    lineHeight: 1.5,
                    fontSize: '0.875rem',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Quick Replies */}
      <Box 
        sx={{ 
          px: 2,
          py: 1,
          display: 'flex',
          gap: 1,
        }}
      >
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
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5,
              minHeight: 0,
              borderRadius: 1.5,
            }}
          >
            {reply}
          </Button>
        ))}
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
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 2,
            p: 0.5,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Ask anything..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSend()}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'transparent',
                color: 'white',
                fontSize: '0.875rem',
                '& fieldset': {
                  border: 'none',
                },
                '& .MuiOutlinedInput-input': {
                  p: 1,
                }
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{ 
              color: 'white',
              p: 0.5,
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};
