import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Snackbar } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close';
import server from '../environment';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [fullscreenVideo, setFullscreenVideo] = useState(null);
    let [snackbarOpen, setSnackbarOpen] = useState(false);
    let [snackbarMessage, setSnackbarMessage] = useState("");

    const videoRef = useRef([])
    let [videos, setVideos] = useState([])

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    }, [])

    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        const chatDisplay = document.querySelector(`.${styles.chattingDisplay}`);
        if (chatDisplay) {
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        }
    }, [messages]);

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: videoAvailable, 
                    audio: audioAvailable 
                });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    let getDisplayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    // Skip your own socket ID
                    if (socketListId === socketIdRef.current) {
                        console.log("Skipping own socket ID:", socketListId);
                        return;
                    }

                    console.log("Creating connection for:", socketListId);
                    
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].ontrack = (event) => {
                        console.log("RECEIVED TRACK FROM:", socketListId);

                        setVideos(prevVideos => {
                            const videoExists = prevVideos.find(video => video.socketId === socketListId);
                            
                            if (videoExists) {
                                console.log("UPDATING existing video for:", socketListId);
                                const updatedVideos = prevVideos.map(video =>
                                    video.socketId === socketListId 
                                        ? { ...video, stream: event.streams[0] } 
                                        : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            } else {
                                console.log("CREATING NEW video for:", socketListId);
                                const newVideo = {
                                    socketId: socketListId,
                                    stream: event.streams[0],
                                    autoplay: true,
                                    playsinline: true
                                };
                                const updatedVideos = [...prevVideos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }
                        });
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            window.localStream.getTracks().forEach(track => {
                                connections[id2].addTrack(track, window.localStream);
                            });
                        } catch (e) { console.log(e) }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
    }
    
    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])
    
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        
        window.location.href = "/home"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    
    let closeChat = () => {
        setModal(false);
    }
    
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        if (message.trim()) {
            console.log(socketRef.current);
            socketRef.current.emit('chat-message', message, username)
            setMessage("");
        }
    }

    // ✅ VALIDATION: Check if username is provided before joining
    let connect = () => {
        if (!username || username.trim() === "") {
            setSnackbarMessage("Please enter your name to join the meeting");
            setSnackbarOpen(true);
            return;
        }
        
        setAskForUsername(false);
        getMedia();
    }

    const toggleFullscreen = (videoId) => {
        if (fullscreenVideo === videoId) {
            setFullscreenVideo(null);
        } else {
            setFullscreenVideo(videoId);
        }
    }

    return (
        <div>
            {askForUsername === true ?
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <h2 style={{ 
                            textAlign: 'center', 
                            marginBottom: '2rem', 
                            color: '#2d3748',
                            fontSize: 'clamp(1.5rem, 4vw, 1.8rem)'
                        }}>
                            Enter Meeting Lobby
                        </h2>
                        <TextField 
                            id="outlined-basic" 
                            label="Your Name" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            variant="outlined"
                            fullWidth
                            required
                            error={username === "" && snackbarOpen}
                            helperText={username === "" && snackbarOpen ? "Name is required" : ""}
                            style={{ marginBottom: '1.5rem' }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    connect();
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                }
                            }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={connect}
                            fullWidth
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Join Meeting
                        </Button>
                        <div style={{ marginTop: '2rem' }}>
                            <video ref={localVideoref} autoPlay muted style={{
                                width: '100%',
                                borderRadius: '12px',
                                transform: 'scaleX(-1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}></video>
                        </div>
                    </div>
                </div> :
                <div className={styles.meetVideoContainer}>
                    {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <h1>
                                Chat
                                <IconButton 
                                    onClick={() => setModal(false)}
                                    sx={{ 
                                        display: { xs: 'block', md: 'none' },
                                        color: '#667eea'
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </h1>
                            <div className={styles.chattingDisplay}>
                                {messages.length !== 0 ? messages.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            <p>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p style={{ textAlign: 'center', color: '#999' }}>No messages yet</p>}
                            </div>
                            <div className={styles.chattingArea}>
                                <TextField 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    id="outlined-basic" 
                                    label="Type a message" 
                                    variant="outlined"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                        }
                                    }}
                                />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    </div> : <></>}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='error'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted style={{
                        transform: 'scaleX(-1)'
                    }}></video>

                    <div className={fullscreenVideo ? styles.fullscreenView : styles.conferenceView}>
                        {videos.map((video) => (
                            <div 
                                key={video.socketId}
                                style={{
                                    position: fullscreenVideo === video.socketId ? 'fixed' : 'relative',
                                    top: fullscreenVideo === video.socketId ? 0 : 'auto',
                                    left: fullscreenVideo === video.socketId ? 0 : 'auto',
                                    width: fullscreenVideo === video.socketId ? '100vw' : 'auto',
                                    height: fullscreenVideo === video.socketId ? '100vh' : 'auto',
                                    zIndex: fullscreenVideo === video.socketId ? 100 : 'auto',
                                }}
                            >
                                <IconButton
                                    onClick={() => toggleFullscreen(video.socketId)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        color: 'white',
                                        background: 'rgba(0,0,0,0.5)',
                                        zIndex: 10
                                    }}
                                >
                                    {fullscreenVideo === video.socketId ? <FullscreenExitIcon /> : <FullscreenIcon />}
                                </IconButton>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    style={{
                                        transform: 'scaleX(-1)',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                >
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            }
            
            {/* Snackbar for validation messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
        </div>
    )
}