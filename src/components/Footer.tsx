import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = () => {
  const [year, setYear] = useState('');
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  return (
    <Box component="footer" py={2} textAlign="center" bgcolor="#1A237E" color="#FFD600">
      <Typography variant="body2">
        جميع الحقوق محفوظة &copy; منصة طوق للكاستينج {year && year}
      </Typography>
    </Box>
  );
};

export default Footer; 