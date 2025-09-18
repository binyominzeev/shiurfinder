import React, { useState } from 'react';

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [parasha, setParasha] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !parasha) {
      setMessage('Please select a CSV file and enter the parasha name.');
      return;
    }
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parasha', parasha);
    try {
      const token = localStorage.getItem('token'); // Assumes admin is logged in
      const res = await fetch('/api/admin/upload-shiurim', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Upload successful!');
      } else {
        setMessage(data.message || 'Upload failed.');
      }
    } catch (err) {
      setMessage('Error uploading file.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Admin Shiurim CSV Upload</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Weekly Parasha:</label>
          <input
            type="text"
            value={parasha}
            onChange={e => setParasha(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="e.g. Nitzavim"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>CSV File:</label>
          <input type="file" accept=".csv" onChange={handleFileChange} required />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <div style={{ marginTop: 16 }}>{message}</div>}
    </div>
  );
};

export default AdminUpload;
