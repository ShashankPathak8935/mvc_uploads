const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const ExcelData = require("../models/ExcelData"); // Import the model

const upload = multer({ dest: "uploads/" });

const handleFileUpload = async (req, res) => {
  const file = req.file;
  const uploadUsersId = req.body.upload_users_id;

  console.log("Received user ID:", uploadUsersId); // Debugging line

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Read and parse the uploaded file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Check if the parsed data is empty
    if (data.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "The file is empty" });
    }

    // Validation check for all rows before inserting any data
    for (const row of data) {
      // Check if email is missing
      if (!row.email) {
        fs.unlinkSync(file.path); // Clean up uploaded file
        return res.status(400).json({ message: "Please enter email for all rows." });
      }
      
      // Check if the email already exists in the database
      const existingRecord = await ExcelData.findOne({
        where: { email: row.email },
      });
      if (existingRecord) {
        fs.unlinkSync(file.path); // Clean up uploaded file
        return res.status(400).json({
          message: `The email ${row.email} already exists in the database.`,
        });
      }

      // Check if the contact number is empty
      if (!row.contact_no) {
        fs.unlinkSync(file.path); // Clean up uploaded file
        return res.status(400).json({ message: "Please enter your contact no for all rows." });
      }
    }

    // Insert data into PostgreSQL after all validations pass
    for (const row of data) {
      await ExcelData.create({
        name: row.name,
        email: row.email,
        contact_no: row.contact_no,
        gender: row.gender,
        address: row.address,
        upload_users_id: uploadUsersId,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({ message: "File data successfully uploaded" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "server error" });
  }
};

module.exports = { upload, handleFileUpload };
