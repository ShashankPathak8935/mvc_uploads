import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Home = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'text/plain', // .txt
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    } else {
      setFile(null);
      setError('Unsupported file type! Please select a file with one of the following types: .xlsx, .xls, .csv, .txt');
      e.target.value = '';
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file before uploading.');
      setSuccess('');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    const userId = localStorage.getItem('userId');
    formData.append('upload_users_id', userId);

    try {
      const response = await fetch('http://localhost:8000/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSuccess('File uploaded successfully!');
        setError('');
        setFile(null);
        fileInputRef.current.value = '';
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(`Upload failed: ${data.message || 'An error occurred'}`);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewData = () => {
    navigate('/viewdata');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-4">
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-4">
              <label htmlFor="file" className="block text-gray-700">Select a file:</label>
              <input
                type="file"
                id="file"
                name="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv,.txt"
                className="mt-2 block w-full text-sm text-gray-700 border rounded-md"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={handleViewData}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
              >
                View Data
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
