import React, { useState } from 'react';

const Editor = () => {
    const [content, setContent] = useState(""); 

    const handleContentChange = (e) => {
        setContent(e.target.value);
    };

    return (
        <div className="editor-container">
            <textarea
                className="rte"
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing here..."
            ></textarea>
        </div>
    );
};

export default Editor;
