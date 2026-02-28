
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            setError(''); 
            if (formState === 0) {
                let result = await handleLogin(username, password)
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setName("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            console.log(err);
            let errorMessage = err?.response?.data?.message || 'An error occurred';
            setError(errorMessage);
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        position: 'relative',
                        backgroundImage: 'url(/logo3.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                        }
                    }}
                >
                    <Box sx={{ 
                        position: 'relative', 
                        zIndex: 1, 
                        color: 'white', 
                        textAlign: 'center',
                        padding: '2rem'
                    }}>
                        <img 
                            src="/logo3.png" 
                            alt="Nexus Logo" 
                            style={{ 
                                maxWidth: '400px', 
                                width: '100%',
                                marginBottom: '2rem',
                                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                            }} 
                        />
                        <h1 style={{ 
                            fontSize: 'clamp(2rem, 5vw, 3rem)', 
                            marginBottom: '1rem',
                            fontWeight: 700,
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                            Welcome to Nexus
                        </h1>
                        <p style={{ 
                            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                            opacity: 0.95,
                            maxWidth: '500px',
                            margin: '0 auto',
                            lineHeight: 1.6
                        }}>
                            Connect with your loved ones through premium video calls. Experience crystal-clear quality and seamless communication.
                        </p>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ 
                            m: 1, 
                            bgcolor: 'transparent',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: 56,
                            height: 56
                        }}>
                            <LockOutlinedIcon sx={{ fontSize: 30 }} />
                        </Avatar>

                        <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2 }}>
                            <Button 
                                variant={formState === 0 ? "contained" : "outlined"} 
                                onClick={() => { 
                                    setFormState(0);
                                    setError('');
                                }}
                                sx={{
                                    ...(formState === 0 && {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    })
                                }}
                            >
                                Sign In
                            </Button>
                            <Button 
                                variant={formState === 1 ? "contained" : "outlined"} 
                                onClick={() => { 
                                    setFormState(1);
                                    setError('');
                                }}
                                sx={{
                                    ...(formState === 1 && {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    })
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAuth();
                                    }
                                }}
                            />

                            {error && (
                                <Box sx={{ 
                                    mt: 2, 
                                    p: 1.5, 
                                    bgcolor: '#ffebee', 
                                    borderRadius: 2,
                                    border: '1px solid #ffcdd2'
                                }}>
                                    <p style={{ 
                                        color: "#d32f2f", 
                                        margin: 0,
                                        fontSize: '0.95rem'
                                    }}>
                                        {error}
                                    </p>
                                </Box>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 3, 
                                    mb: 2,
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
                                    }
                                }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Sign In" : "Create Account"}
                            </Button>

                            {formState === 0 && (
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                        Don't have an account?{' '}
                                        <span 
                                            onClick={() => setFormState(1)}
                                            style={{ 
                                                color: '#667eea', 
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            Sign Up
                                        </span>
                                    </p>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />
        </ThemeProvider>
    );
}