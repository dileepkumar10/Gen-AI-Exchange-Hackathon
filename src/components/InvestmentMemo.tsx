import { Box, Typography, Paper } from '@mui/material';

export const InvestmentMemo = ({ data }: { data: any }) => {
  return (
    <Paper 
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        p: 3,
        mb: 3,
        minHeight: '200px',
        width: '100%'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            mb: 2 
          }}
        >
          Executive Summary
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {data.executiveSummary}
        </Typography>
      </Box>

      {/* Analysis Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.sections?.map((section: any, index: number) => (
          <Box key={index}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                mb: 2 
              }}
            >
              {section.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
