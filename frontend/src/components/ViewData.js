import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ViewData = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 5;

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
        const filtered = data.filter(item => {
            return (
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.contact_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        setFilteredData(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reset to the first page when search query changes
    }, [searchQuery, data]);

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

    // Function to export data as Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'User Data');

        XLSX.writeFile(workbook, 'UserData.xlsx');
    };

    // Function to export data as PDF
    const handleExportPdf = () => {
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
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">User Information</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Download Excel File
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Download Pdf File
                    </button>
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
                    {currentItems.map((item) => (
                        <tr key={item.id}>
                            <td className="border border-gray-300 px-4 py-2">{item.id}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.email}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.contact_no}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.gender}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    Previous
                </button>
                <span className="self-center">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ViewData;
