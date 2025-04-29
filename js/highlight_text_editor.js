import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function HighlightTextEditor() {
  const [editorContent, setEditorContent] = useState('');

  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  const saveHighlightedText = async () => {
    const response = await fetch('/api/save-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: editorContent }),
    });

    if (response.ok) {
      alert('Notes saved!');
    } else {
      alert('Failed to save notes.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Highlight Your Notes</h1>
      <ReactQuill
        value={editorContent}
        onChange={handleEditorChange}
        theme="snow"
        modules={quillModules}
        formats={quillFormats}
        className="bg-white rounded shadow"
      />
      <button
        onClick={saveHighlightedText}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Notes
      </button>
    </div>
  );
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline',
  'color', 'background',
  'list', 'bullet',
]
