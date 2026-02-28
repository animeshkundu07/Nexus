// import React, { useContext, useState } from 'react'
// import withAuth from '../utils/withAuth'
// import { useNavigate } from 'react-router-dom'
// import "../App.css";
// import { Button, IconButton, TextField } from '@mui/material';
// import RestoreIcon from '@mui/icons-material/Restore';
// import { AuthContext } from '../contexts/AuthContext';

// function HomeComponent() {


//     let navigate = useNavigate();
//     const [meetingCode, setMeetingCode] = useState("");


//     const {addToUserHistory} = useContext(AuthContext);
//     let handleJoinVideoCall = async () => {
//         await addToUserHistory(meetingCode)
//         navigate(`/${meetingCode}`)
//     }

//     return (
//         <>

//             <div className="navBar">

//                 <div style={{ display: "flex", alignItems: "center" }}>

//                     <h2>Nexus</h2>
//                 </div>

//                 <div style={{ display: "flex", alignItems: "center" }}>
//                     <IconButton onClick={
//                         () => {
//                             navigate("/history")
//                         }
//                     }>
//                         <RestoreIcon />
//                     </IconButton>
//                     <p>History</p>

//                     <Button onClick={() => {
//                         localStorage.removeItem("token")
//                         navigate("/auth")
//                     }}>
//                         Logout
//                     </Button>
//                 </div>


//             </div>


//             <div className="meetContainer">
//                 <div className="leftPanel">
//                     <div>
//                         <h2>Providing Quality Video Call Just Like Quality Education</h2>

//                         <div style={{ display: 'flex', gap: "10px" }}>

//                             <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
//                             <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

//                         </div>
//                     </div>
//                 </div>
//                 <div className='rightPanel'>
//                     <img srcSet='/logo3.png' alt="" />
//                 </div>
//             </div>
//         </>
//     )
// }


// export default withAuth(HomeComponent)


import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Snackbar } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    // Generate random meeting code (3 letters + 1 digit)
    const generateMeetingCode = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        
        let code = '';
        // Add 3 random letters
        for (let i = 0; i < 3; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        // Add 1 random digit
        code += digits.charAt(Math.floor(Math.random() * digits.length));
        
        setGeneratedCode(code);
        setMeetingCode(code);
        return code;
    };

    const handleCreateMeeting = async () => {
        const code = generateMeetingCode();
        await addToUserHistory(code);
        navigate(`/${code}`);
    };

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            setSnackbarMessage("Please enter a meeting code");
            setSnackbarOpen(true);
            return;
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setSnackbarMessage("Meeting code copied!");
        setSnackbarOpen(true);
    };

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>Nexus</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <IconButton 
                        onClick={() => navigate("/history")}
                        style={{ color: "#667eea" }}
                    >
                        <RestoreIcon />
                    </IconButton>
                    <p style={{ cursor: "pointer", margin: 0 }} onClick={() => navigate("/history")}>
                        History
                    </p>

                    <Button 
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        variant="outlined"
                        color="error"
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Premium Video Calls, Powered by Innovation</h2>
                        <p style={{ marginTop: "1rem", color: "#666", fontSize: "1.1rem" }}>
                            Connect with anyone, anywhere, with crystal-clear quality
                        </p>

                        <div className="meetingOptions">
                            {/* Create Meeting Card */}
                            <div className="meetingCard">
                                <h3>
                                    <AddIcon /> Create New Meeting
                                </h3>
                                <p>Start an instant meeting with a unique code</p>
                                {generatedCode && (
                                    <div className="generatedCodeDisplay">
                                        <span className="codeText">{generatedCode}</span>
                                        <IconButton 
                                            size="small" 
                                            onClick={handleCopyCode}
                                            style={{ color: "#667eea" }}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                )}
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    onClick={handleCreateMeeting}
                                    style={{ 
                                        marginTop: "1rem",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        padding: "0.8rem"
                                    }}
                                >
                                    Create Meeting
                                </Button>
                            </div>

                            {/* Join Meeting Card */}
                            <div className="meetingCard">
                                <h3>Join Existing Meeting</h3>
                                <p>Enter a meeting code to join</p>
                                <TextField 
                                    onChange={e => setMeetingCode(e.target.value.toUpperCase())} 
                                    value={meetingCode}
                                    id="outlined-basic" 
                                    label="Meeting Code" 
                                    variant="outlined"
                                    fullWidth
                                    style={{ marginTop: "1rem" }}
                                    placeholder="e.g., ABC1"
                                    inputProps={{ maxLength: 4 }}
                                />
                                <Button 
                                    onClick={handleJoinVideoCall} 
                                    variant="contained"
                                    fullWidth
                                    style={{ 
                                        marginTop: "1rem",
                                        background: "#FF9839",
                                        padding: "0.8rem"
                                    }}
                                >
                                    Join Meeting
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='rightPanel'>
                    <img src='/logo3.png' alt="Nexus Logo" />
                </div>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </>
    )
}

export default withAuth(HomeComponent)