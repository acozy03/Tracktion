import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import background from "../assets/background.png";
import homeScreen from "../assets/home-screen.png";
import HomePage from "../pages/HomePage";

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", monospace',
  },
  palette: {
    primary: {
      main: "#000",
    },
    background: {
      default: "transparent",
    },
  },
});

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

  function buildPath(route: string): string {
    return `https://tracktion-backend.vercel.app${route}`
      
  }

  useEffect(() => {
    const verified = new URLSearchParams(location.search).get('verified');
    if (verified === 'true') {
      setIsVerified(true);
      setMessage('Email verified successfully. You can now log in.');
    }
  }, [location]);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (isRegister) {
      if (!validateEmail(email)) {
        setMessage("Please enter a valid email address.");
        return;
      }
      if (!validatePassword(password)) {
        setMessage("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.");
        return;
      }
    }
    const endpoint = isRegister ? "/api/register" : "/api/login";
    const userData = isRegister
      ? { username, email, password, firstName, lastName }
      : { login, password };

    try {
      const response = await fetch(buildPath(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      console.log("Submitting data", userData);
      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok && (data.success || !data.error)) {
        if (isRegister || data.needsVerification) {
          setMessage("Please check your email for verification.");
          setShowResendVerification(true);
        } else {
          if (data.id !== -1) {
            localStorage.setItem('userId', data.id.toString());
            localStorage.setItem('firstName', data.firstName);
            return (
              <HomePage />
            );
          } else {
            setMessage(data.error || "An error occurred during login.");
          }
        }
      } else {
        if (data.needsVerification) {
          setMessage("This email is registered but not verified. Please verify your email.");
          setShowResendVerification(true);
        } else {
          setMessage(data.error || (isRegister ? "Registration failed" : "Invalid credentials"));
        }
      }
    } catch (error) {
      console.error('Error during login/register:', error);
      setMessage(isRegister ? "Error during registration" : "Error logging in");
    }
  }

  async function handleForgotPassword() {
    try {
      const response = await fetch(buildPath("/api/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset instructions sent to your email.");
      } else {
        setMessage(data.error || "Error processing your request.");
      }
    } catch (error) {
      console.error('Error during forgot password:', error);
      setMessage("Error processing your request.");
    }
    setForgotPasswordOpen(false);
  }

  async function handleResendVerification() {
    try {
      const response = await fetch(buildPath("/api/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: isRegister ? email : login }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Verification email resent. Please check your inbox.");
      } else {
        setMessage(data.error || "Error resending verification email.");
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setMessage("Error resending verification email.");
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "stretch",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="xl" sx={{ p: 0 }}>
          <Grid container sx={{ minHeight: "100vh" }}>
            {/* Left side - Image */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                }}
              >
                <img
                  src={homeScreen}
                  alt="Workspace"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "fill",
                    borderRadius: "10px",
                  }}
                />
              </Box>
            </Grid>

            {/* Right side - Login Form */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                }}
              >
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    width: "100%",
                    maxWidth: "500px",
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "3rem",
                    borderRadius: "16px",
                  }}
                >
                  {isRegister ? (
                    <>
                      <TextField
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        InputProps={{ style: { fontSize: "1rem" } }}
                      />
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        InputProps={{ style: { fontSize: "1rem" } }}
                      />
                      <TextField
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        InputProps={{ style: { fontSize: "1rem" } }}
                      />
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        InputProps={{ style: { fontSize: "1rem" } }}
                      />
                    </>
                  ) : (
                    <TextField
                      required
                      fullWidth
                      id="login"
                      label="Username or Email"
                      name="login"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      InputProps={{ style: { fontSize: "1rem" } }}
                    />
                  )}
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    InputProps={{ style: { fontSize: "1rem" } }}
                  />
                  {isRegister && (
                    <FormHelperText>
                      Password must be at least 8
characters long and contain at least one letter, one number, and one special character.
                    </FormHelperText>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      fontSize: "1rem",
                      py: 2,
                      mt: 3,
                      mb: 2,
                      backgroundColor: "#69FCD9",
                      color: theme.palette.primary.main,
                      borderRadius: "24px",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    {isRegister ? "Register" : "Sign In"}
                  </Button>
                  {message && (
                    <Typography
                      color="error"
                      align="center"
                      sx={{ mt: 1, mb: 1 }}
                    >
                      {message}
                    </Typography>
                  )}
                  {showResendVerification && (
                    <Button
                      onClick={handleResendVerification}
                      fullWidth
                      variant="outlined"
                      sx={{
                        fontSize: "1rem",
                        py: 1,
                        mt: 2,
                        mb: 2,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        borderRadius: "24px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Resend Verification Email
                    </Button>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsRegister(!isRegister);
                        setMessage("");
                        setShowResendVerification(false);
                      }}
                      sx={{
                        width: "48%",
                        fontSize: "1rem",
                        textTransform: "none",
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        borderRadius: "24px",
                        py: 1.5,
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      {isRegister ? "Login" : "Register"}
                    </Button>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => setForgotPasswordOpen(true)}
                      sx={{
                        width: "48%",
                        fontSize: "1rem",
                        textAlign: "center",
                        color: theme.palette.primary.main,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword}>Reset Password</Button>
        </DialogActions>
      </Dialog>
      {isVerified && (
        <Typography color="primary" align="center" sx={{ mt: 2 }}>
          Email verified successfully. You can now log in.
        </Typography>
      )}
    </ThemeProvider>
  );
}

