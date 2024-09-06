import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const ViewData = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(''); // State to handle notifications
  const [excelNotification, setExcelNotification] = useState(''); // State for Excel notification
  const [pdfNotification, setPdfNotification] = useState(''); // State for PDF notification
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');

        if (!userId) {
          setError('User not logged in');
          return;
        }

        const response = await fetch('http://localhost:8000/api/files/data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'upload_users_id': userId, // Send user ID as a header
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
          setFilteredData(result);
          setTotalPages(Math.ceil(result.length / itemsPerPage));
        } else {
          const result = await response.json();
          setError(`Error fetching data: ${result.message || 'An error occurred'}`);
        }
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      return (
        (item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (item.email ? item.email.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (item.contact_no ? item.contact_no.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (item.gender ? item.gender.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (item.address ? item.address.toLowerCase().includes(searchQuery.toLowerCase()) : false)
      );
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to the first page when search query changes
  }, [searchQuery, data]);

  // Effect to clear notifications and errors after 5 seconds
  useEffect(() => {
    if (error || notification || excelNotification || pdfNotification) {
      const timer = setTimeout(() => {
        setError('');
        setNotification('');
        setExcelNotification('');
        setPdfNotification('');
      }, 3000); // Clear messages after 5 seconds

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [error, notification, excelNotification, pdfNotification]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      setNotification('Excel data is not available.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Data');
    XLSX.writeFile(workbook, 'UserData.xlsx');
    setNotification(''); // Clear any previous notifications
    setExcelNotification('Excel file has been downloaded successfully.'); // Set Excel notification
  };

  const handleBack = () => {
    navigate('/home')
  }

  const handleExportPdf = () => {
    if (filteredData.length === 0) {
      setNotification('pdf data not available.');
      return;
    }
    const doc = new jsPDF();
    const tableColumn = ["ID", "Name", "Email", "Contact No", "Gender", "Address"];
    const tableRows = [];

    filteredData.forEach(item => {
      const itemData = [
        item.id,
        item.name,
        item.email,
        item.contact_no,
        item.gender,
        item.address
      ];
      tableRows.push(itemData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('UserData.pdf');
    setNotification(''); // Clear any previous notifications
    setPdfNotification('PDF file has been downloaded successfully.'); // Set PDF notification
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">User Information</h2>
        <div className="flex flex-col items-start space-y-2">
          <div className="flex items-center space-x-4">
          <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Back
            </button>
            <button
        onClick={handleExportExcel}
        className="px-4 py-2 bg-green-500 text-white rounded flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faFileExcel} className="text-white text-xl" />
      </button>
      <button
        onClick={handleExportPdf}
        className="px-4 py-2 bg-red-500 text-white rounded flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faFilePdf} className="text-white text-xl" />
      </button>
          </div>
          {/* Notifications related to file downloads */}
          {excelNotification && <p className="text-green-500">{excelNotification}</p>}
          {pdfNotification && <p className="text-green-500">{pdfNotification}</p>}
          {notification && <p className="text-red-500">{notification}</p>}
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search..using name, email, contact no, address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md p-2 border border-gray-300 rounded"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full mt-4 border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Contact No</th>
            <th className="border border-gray-300 px-4 py-2">Gender</th>
            <th className="border border-gray-300 px-4 py-2">Address</th>
          </tr>
        </thead>
        <tbody>
  {currentItems.map((item, index) => (
    <tr key={item.id}>
      {/* Display ID starts from 1 and increments with each item */}
      <td className="border border-gray-300 px-4 py-2">
        {indexOfFirstItem + index + 1}
      </td>
      <td className="border border-gray-300 px-4 py-2">{item.name || '-'}</td>
      <td className="border border-gray-300 px-4 py-2">{item.email || '-'}</td>
      <td className="border border-gray-300 px-4 py-2">{item.contact_no || '-'}</td>
      <td className="border border-gray-300 px-4 py-2">{item.gender || '-'}</td>
      <td className="border border-gray-300 px-4 py-2">{item.address || '-'}</td>
    </tr>
  ))}
</tbody>

      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Previous
        </button>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ViewData;
