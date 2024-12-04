import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Client from '../pages/Client';
import ACTIONS from '../Actions';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [content, setContent] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [fileName, setFileName] = useState('');
    const hasJoinedRef = useRef(false); // Ref to track if the user has joined

    useEffect(() => {
        const init = async () => {
            if (!socketRef.current) {
                socketRef.current = await initSocket();
    
                socketRef.current.on('connect_error', (error) => {
                    console.error('Connection Error:', error);
                    toast.error('Connection failed. Please try again later.');
                    reactNavigator('/');
                });
    
                socketRef.current.on('connect_failed', () => {
                    toast.error('Connection failed. Please check your internet and try again.');
                });
    
                if (!hasJoinedRef.current) {
                    hasJoinedRef.current = true;
                    socketRef.current.emit(ACTIONS.JOIN, {
                        roomId,
                        username: location.state?.username,
                    });
                }
    
                socketRef.current.on(ACTIONS.JOINED, ({ clients, username }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);
                });
    
                socketRef.current.on(ACTIONS.DISCONNECTED, ({ clients, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients(clients); // Update the client list here
                });
                
    
                socketRef.current.on(ACTIONS.SYNC_CODE, (newContent) => {
                    setContent(newContent);
                });
            }
        };
    
        init();
    
        return () => {
            if (socketRef.current) {
                socketRef.current.emit(ACTIONS.LEAVE, {
                    roomId,
                    username: location.state?.username,
                });
                socketRef.current.disconnect();
                socketRef.current = null;
                hasJoinedRef.current = false;
            }
        };
    }, [location.state, roomId, reactNavigator]);
    
    const handleContentChange = (value) => {
        setContent(value);
        if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, content: value });
        }
    };

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId);
        toast.success('Workspace ID copied to clipboard!');
    };

    const handleLeave = () => {
        if (socketRef.current) {
            const username = location.state?.username;
            socketRef.current.emit(ACTIONS.LEAVE, { roomId, username });
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        reactNavigator('/');
    };
    
    

    const handleDownloadClick = () => {
        setShowPopup(true);
    };

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/logo.png" alt="Logo" />
                    </div>
                    <h3 className="sectionHeading">Developers Joined:</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={handleCopy}>
                    Copy Workspace ID
                </button>
                <button className="btn leaveBtn" onClick={handleLeave}>
                    Exit Workspace
                </button>
                <button className="save-btn" onClick={handleDownloadClick}>
                    💾 Save
                </button>
            </div>

            <div className="editorWrap">
                <textarea
                    className="rte"
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start writing here..."
                ></textarea>
            </div>

            {showPopup && (
                <div className="popup">
                    <div className="popupContent">
                        <h3>Enter File Name:</h3>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="fileNameInput"
                            placeholder="File Name"
                        />
                        <div className="popupButtons">
                            <button className="saveBtn">Save</button>
                            <button className="closeBtn" onClick={() => setShowPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;
