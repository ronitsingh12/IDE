import React from 'react';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import "./App.css";
import Home from './Components/Home';
import EditorPage from './Components/EditorPage';

function App() {
    return (
        <>
            <div>
                <Toaster position='top-right' toastOptions={{
                    success: {
                        theme:{
                            primary: '#00bfff',
                        },
                    },
                }}></Toaster>
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}></Route>
                    <Route path="/editor/:roomId" element={<EditorPage/>}></Route>
                </Routes>
            
            </BrowserRouter>
        </>
    );
}

export default App;

