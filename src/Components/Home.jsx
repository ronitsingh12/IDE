import React,{useState} from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate=useNavigate();
    const[workId,setWorkId] =useState('');
    const[username,setUsername] =useState('');
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setWorkId(id);
        toast.success('Created a new Workspace');
    };

    const joinWork = () => {
        if(!workId || !username){
            toast.error('Workspace Id and Username must be provided!');
            return;
        }

        navigate(`/editor/${workId}`,{
            state:{
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        console.log('event',e.code);
        if(e.code === 'Enter'){
            joinWork();
        }
    }

    return (
        <div className="homepageWrap">
            <div className="formWrap">
                <img className="hplogo" src="/logo.png" alt="Fusion" />
                <h4 className="mainLabel">Paste Invitation Workspace ID</h4>
                <div className="inputGroup">
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="Enter Workspace ID"
                        onChange={(e) => setWorkId(e.target.value)}
                        value={workId}
                        onKeyUp={handleInputEnter}
                    />
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="Enter Your Name" 
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinWork}>Join</button>
                    <span className="createInfo">
                        Want to create your personalized workspace? &nbsp;
                        <a onClick={createNewRoom} href="/" className="createNewBtn">Create New Workspace</a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>Built with <span className="heart">❤️</span> By Fusion Team</h4>
            </footer>
        </div>
    );
};

export default Home;