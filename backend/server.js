const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const sequelize = require('./config/db');
const someRoutes = require('./routes/someRoutes'); // Example routes
const signupRoutes = require('./routes/signupRoutes'); // Import the new signup route
const loginRoutes = require('./routes/loginRoutes'); // Import the login routes
const fileUploadRoutes = require('./routes/fileUploadRoutes'); // Import the file upload routes
const dataRoutes = require('./routes/dataRoutes');



const app = express();


app.use(cors());
app.use(express.json());

// Use your routes
app.use('/api/items', someRoutes);
app.use('/api', signupRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/files', dataRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Database connection successful`)
    console.log(`Server is running on port ${PORT}`);
  });





