require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');






const app = express();
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});
const upload = multer({ storage: storage });

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});
// User registration endpoint
app.post('/register', (req, res) => {
    const { email, first_name, last_name, phone, password } = req.body; 

    // Validate input
    if (!email || !first_name || !last_name || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Save the user to the database
        const query = 'INSERT INTO users (email, first_name, last_name, phone, password) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [email, first_name, last_name, phone, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error registering user:', error);
                return res.status(500).json({ message: 'Error registering user' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Error querying user:', error);
            return res.status(500).json({ message: 'Error querying user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return res.status(200).json({ message: 'Login successful', userId: user.id }); // Include user ID
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    });
});



   // Admin registration endpoint
app.post('/admin/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body; 
    const role = 'admin'; // Set role to 'admin'

    // Validate input
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Save the admin to the database
        const query = 'INSERT INTO users (email, first_name, last_name, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [email, firstName, lastName, hashedPassword, role], (error, results) => {
            if (error) {
                console.error('Error registering admin:', error);
                return res.status(500).json({ message: 'Error registering admin' });
            }
            res.status(201).json({ message: 'Admin registered successfully' });
        });
    });
});



// Admin login route
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query the database for the user
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Error querying user:', error);
            return res.status(500).json({ message: 'Error querying user' });
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0]; 

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            // Check if the user is an admin
            if (user.role === 'admin') { 
                
                return res.status(200).json({ message: 'Login successful', role: user.role });
            } else {
                // Triggered if the role is not 'admin'
                return res.status(403).json({ message: 'Access denied: Admins only' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    });
});



app.post('/report', upload.single('media-upload'), (req, res) => {
    const { userId, name, age, gender, county, subcounty, area, incidentType, description, incidentDate } = req.body;
    const mediaUpload = req.file ? req.file.filename : null;

    // Validate inputs
    if (!userId || isNaN(parseInt(userId)) || !name || !age || !gender || !county || !subcounty || !area || !incidentType || !description || !incidentDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
        INSERT INTO reports 
        (user_id, name, age, gender, county, subcounty, area, incident_type, description, media_upload, incident_date, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    db.query(sql, [parseInt(userId), name, age, gender, county, subcounty, area, incidentType, description, mediaUpload, incidentDate], (err, result) => {
        if (err) {
            console.error("Error submitting report:", err);
            return res.status(500).json({ message: 'Error submitting report' });
        }
        res.status(201).json({ message: 'Report submitted successfully' });
    });
});


// Fetch all reports
// Get reports for a specific user
app.get('/reports', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const sql = 'SELECT * FROM reports WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching reports:', err);
            return res.status(500).json({ message: 'Error fetching reports' });
        }
        res.json(results);
    });
});

// Route to fetch reported cases from 'reports' table
app.get('/admin/reported-cases', (req, res) => {
    const query = `
        SELECT 
            id AS caseId, 
            name AS reportedBy, 
            description, 
            created_at AS dateReported 
        FROM reports
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reported cases:', err);
            return res.status(500).json({ error: 'Failed to fetch cases' });
        }
        res.json(results);
    });
});
// Endpoint to fetch case details by caseId

app.get('/admin/case-details/:id', (req, res) => {
    const caseId = req.params.id;
    
    const query = 'SELECT * FROM reports WHERE id = ?';
    db.query(query, [caseId], (error, results) => {
        if (error) {
            console.error('Error fetching case:', error);
            return res.status(500).json({ message: 'Error fetching case' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Case not found' });
        }

        res.status(200).json(results[0]);
    });
});

app.put('/admin/case-details/:caseId/status', (req, res) => {
    const caseId = req.params.caseId;
    const { status } = req.body;

    console.log('Updating case ID:', caseId);
    console.log('New status:', status);

    const query = `UPDATE reports SET status = ? WHERE id = ?`;

    db.query(query, [status, caseId], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Error updating status' });
        }

        if (results.affectedRows === 0) {
            console.warn('No case found with ID:', caseId);
            return res.status(404).json({ message: 'Case not found' });
        }

        console.log('Status updated successfully for case ID:', caseId);
        res.json({ message: 'Status updated successfully' });
    });
});
// Delete case endpoint
app.delete('/admin/case-details/:caseId', (req, res) => {
    const caseId = req.params.caseId;

    const sql = 'DELETE FROM reports WHERE id = ?'; // Adjust the table name to your actual table
    db.query(sql, [caseId], (err, result) => {
        if (err) {
            console.error('Error deleting case:', err);
            return res.status(500).json({ message: 'Error deleting case' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Case not found' });
        }

        res.status(200).json({ message: 'Case deleted successfully' });
    });
});



app.post('/admin/case-details/:id/comments', (req, res) => {
    const caseId = req.params.id;
    const adminId = req.body.adminId; // Get the admin's ID from the request body or session
    const comment = req.body.comment;

    // Insert the new comment into the comments table
    db.query('INSERT INTO comments (report_id, admin_id, comment) VALUES (?, ?, ?)', [caseId, adminId, comment], (error, results) => {
        if (error) {
            return res.status(500).send('Error adding comment');
        }
        res.json({ message: 'Comment added successfully' });
    });
});

// Fetch all users
app.get('/admin/users', (req, res) => {
    const query = 'SELECT id, CONCAT(first_name, " ", last_name) AS name, email, role FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});



// Add a new user
app.post('/admin/users', (req, res) => {
    const { first_name, last_name, email, role, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');
        
        // Insert the new user into the database, including the hashed password
        const query = 'INSERT INTO users (first_name, last_name, email, role, password) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [first_name, last_name, email, role, hashedPassword], (err, results) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'User added successfully', userId: results.insertId });
        });
    });
});

// Delete a user
app.delete('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'User deleted successfully' });
    });
});
// Assuming session-based authentication
app.get('/admin/profile', (req, res) => {
    // Check if the user is logged in and is an admin
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        const adminId = req.session.user.id; // Get admin ID from session

        // Fetch the admin's details from the database
        const query = 'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?';
        db.query(query, [adminId], (err, results) => {
            if (err) return res.status(500).send(err);
            if (results.length > 0) {
                res.json(results[0]); // Send admin details as JSON
            } else {
                res.status(404).send('Admin not found');
            }
        });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Route to fetch admin profile
app.get('/admin/profile', (req, res) => {
    // Check if admin session exists
    if (req.session.admin) {
        const { first_name, last_name } = req.session.admin;  // Admin's name from session
        res.json({ name: `${first_name} ${last_name}` });
    } else {
        res.status(401).json({ error: 'Not authenticated' });  // Unauthorized if not logged in
    }
});

// Route to get the total number of reported cases
app.get('/reported-cases/total', (req, res) => {
    const query = 'SELECT COUNT(*) AS totalReports FROM reports';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reports:', err); // Log the error for debugging
            return res.status(500).json({ message: 'Server error while fetching reports' });
        }

        if (results && results.length > 0) {
            res.status(200).json({ totalReports: results[0].totalReports });
        } else {
            res.status(404).json({ message: 'No reports found' });
        }
    });
});


// Fetch user info route
app.get('/user-info', (req, res) => {
    // Assume the user is authenticated and the user ID is in the request (e.g., from session or JWT)
    const userId = req.query.userId; // This could be set from a session or token
    
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Query the database for the user information
    const sql = 'SELECT first_name, last_name FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).json({ message: 'Error fetching user info' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's name in the response
        const user = results[0];
        res.json({ name: `${user.first_name} ${user.last_name}` });
    });
});
// Admin profile route
app.get('/admin/profile', (req, res) => {
    const adminId = req.user.id; // Assuming you have authentication in place to set `req.user`

    const query = 'SELECT first_name, last_name FROM users WHERE id = ? AND role = "admin"';
    db.query(query, [adminId], (err, results) => {
        if (err) {
            console.error('Error fetching admin profile:', err);
            return res.status(500).json({ error: 'Failed to fetch admin profile' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const admin = results[0];
        res.json({ name: `${admin.first_name} ${admin.last_name}` });
    });
});



// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});