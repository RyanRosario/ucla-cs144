import React, { useState } from 'react';
import './style.css';

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [imgStatus, setImgStatus] = useState('');
  const [descStatus, setDescStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setImgStatus('');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    if (!imageFile || !description) return;

    setLoading(true);
    setImgStatus('');
    setDescStatus('');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('description', description);

    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      setImgStatus(result.isHuman ? 'Profile pic looks OK!' : 'Profile pic must be of a human!');
      setDescStatus(result.descriptionFlagged ? 'Description violates content policies' : 'Description looks good!');
    } catch (err) {
      setImgStatus('Error processing image.');
      setDescStatus('Error processing description.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Upload Your Profile Picture!</h1>
      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {imageUrl ? <img src={imageUrl} alt="Preview" className="preview" /> : 'Drag and drop an image here'}
      </div>
      {imgStatus && <p className={imgStatus.includes('OK') ? 'status-ok' : 'status-fail'}>{imgStatus}</p>}
      <textarea
        placeholder="Enter a description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {descStatus && <p className={descStatus.includes('good') ? 'status-ok' : 'status-fail'}>{descStatus}</p>}
      <button onClick={handleSubmit} disabled={loading}>Submit</button>
      {loading && <div className="spinner"></div>}
    </div>
  );
}
