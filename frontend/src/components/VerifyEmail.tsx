import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress } from '@mui/material';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setMessage('Invalid verification link.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`https://tracktion-jade.vercel.app/api/verify-email?token=${token}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setMessage('Email verified successfully. Redirecting to login...');
          setTimeout(() => navigate('/login?verified=true'), 3000);
        } else {
          setMessage(data.error || 'Verification failed.');
        }
      } catch (error) {
        setMessage('An error occurred while verifying your email.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <Container component="main" maxWidth="xs" style={{ textAlign: 'center', marginTop: '20vh' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography variant="h6">{message}</Typography>
      )}
    </Container>
  );
};

export default VerifyEmail;

