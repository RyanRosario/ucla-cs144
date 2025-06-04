import React, { useState } from 'react';
import './style.css';

export default function App() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [imageError, setImageError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setImageError('');
    }
  };

  const handleSubmit = async () => {
    setImageError('');
    setDescriptionError('');
    setLoading(true);

    const formData = new FormData();
    if (image) formData.append('image', image);
    formData.append('description', description);

    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (!result.isHuman) setImageError('Image must be of a human.');
      if (result.descriptionFlagged) setDescriptionError('Description violates content policies.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Upload Your Profile Picture and Description</h1>

      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ background: loading ? '#ffcccc' : 'white' }}
      >
        {image ? image.name : 'Drag and drop an image here'}
      </div>
      {imageError && <p className="error-text">{imageError}</p>}

      <textarea
        className="description-input"
        placeholder="Enter a description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {descriptionError && <p className="error-text">{descriptionError}</p>}

      <button onClick={handleSubmit} disabled={loading}>Submit</button>
      {loading && <div className="spinner"></div>}
    </div>
  );
}
