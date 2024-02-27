
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');



const app = express();
const port = 3006;

// MongoDB connection URI for remote host
const uri = 'mongodb://localhost/LibraryMan';

// Replace 'your_remote_host' and 'your_port' with the appropriate values

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(express.static('public'));


// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));


// Serve the home page
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Serve the HTML file for the home page
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});


// Serve the HTML file
app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Function to validate email address format
function validateEmail(email) {
    const emailRegex = /@gmail\.com$/;
    return emailRegex.test(email);
}

// Function to validate phone number format
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
}

// Handle form submission
app.post('/signup', async (req, res) => {
    const { studentName, emailAddress, phoneNumber, studentRollNumber, fatherName, bookIssuedName } = req.body;

    // Validate email address
    if (!validateEmail(emailAddress)) {
        return res.status(400).send('Invalid email address format. Please try again.');
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).send('Invalid phone number format. Please try again.');
    }

    // If validation passes, proceed with inserting data into MongoDB
    try {
        await client.connect();
        const database = client.db('LibraryMan');
        const collection = database.collection('studentss');
        await collection.insertOne({ studentName, emailAddress, phoneNumber, studentRollNumber, fatherName, bookIssuedName });
        // res.send('Student data inserted successfully! and U are Good to go '); 
        } catch (error) {
            console.error('Error inserting student data:', error);
            res.status(500).send('Error inserting student data');
        } finally {
        res.redirect('/success.html');
        await client.close();
    }
});

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Handle login form submission

// Add a route to serve motivational.html
app.get('/motivational', (req, res) => {
    res.sendFile(__dirname + '/motivational.html');
});

app.post('/login', async (req, res) => {
    const { rollNumber } = req.body;

    try {
        await client.connect();
        const database = client.db('LibraryMan');
        const collection = database.collection('studentss');
        const student = await collection.findOne({ studentRollNumber: rollNumber });

        if (!student) {
            // return res.status(404).send('Student not found. Please check the roll number.');
            return res.redirect('/motivational');
        }

        // Render student details on a new page
        res.redirect(`/student/${rollNumber}`);
    } catch (error) {
        console.error('Error retrieving student data:', error);
        res.status(500).send('Error retrieving student data: ' + error.message);
    } finally {
        await client.close();
    }
});

// // Serve the student details page
// app.get('/student/:rollNumber', async (req, res) => {
//     const rollNumber = req.params.rollNumber;

//     try {
//         await client.connect();
//         const database = client.db('LibraryMan');
//         const collection = database.collection('studentss');
//         const student = await collection.findOne({ studentRollNumber: rollNumber });

//         if (!student) {
//             return res.status(404).send('Student not found.');
//         }

//         // Render student details page with student data
//         res.sendFile(__dirname + '/student.html');
//     } catch (error) {
//         console.error('Error retrieving student data:', error);
//         res.status(500).send('Error retrieving student data: ' + error.message);
//     } finally {
//         await client.close();
//     }
// });

// may be not usefull

// Serve registered user details
// app.get('/student', async (req, res) => {
//     try {
//         await client.connect();
//         const database = client.db('LibraryMan');
//         const collection = database.collection('studentss');
//         //display all student's data who has signup
//         const allStudents = await collection.find({}).toArray(); 
//         res.json(allStudents); // Send the registered user details as JSON response
//     } catch (error) {
//         console.error('Error retrieving registered details:', error);
//         res.status(500).send('Error retrieving registered details');
//     } finally {
//         await client.close();
//     }
// });
// ********************************************************************************

// Modify the route to handle requests for specific student details based on roll number
app.get('/student/:rollNumber', async (req, res) => {
    const rollNumber = req.params.rollNumber;

    try {
        await client.connect();
        const database = client.db('LibraryMan');
        const collection = database.collection('studentss');
        const student = await collection.findOne({ studentRollNumber: rollNumber });

        if (!student) {
            return res.status(404).send('Student not found.');
        }

        // Construct HTML table rows with student details
        const htmlData = `
        <html>
        <head>
        <title>Student Details</title>
        </head>
        <style>
        body {
            font-family: Arial, sans-serif;
        }
        table {
            width: 50%;
            border-collapse: collapse;
            margin: 20px auto;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
    <table id="student-details">,
        
        
            <tr>
            <th>Attribute</th>
            <th>Data of student</th>
            </tr>
            <tr>
                <td>Student Name</td>
                <td>${student.studentName}</td>
            </tr>
            <tr>
                <td>Email Address</td>
                <td class="blurred">${student.emailAddress}</td>
            </tr>
            <tr>
                <td>Phone Number</td>
                <td class="blurred">${student.phoneNumber}</td>
            </tr>
            <tr>
                <td>Student Roll Number</td>
                <td>${student.studentRollNumber}</td>
            </tr>
            <tr>
                <td>Father's Name</td>
                <td>${student.fatherName}</td>
            </tr>
            <tr>
                <td>Book Issued Name</td>
                <td>${student.bookIssuedName}</td>
            </tr>
            </table>
            </html>
        `;
        
        res.send(htmlData); // Return HTML table rows
    } catch (error) {
        console.error('Error retrieving student data:', error);
        res.status(500).send('Error retrieving student data: ' + error.message);
    } finally {
        await client.close();
    }
});

// *********************************************************************************


// // Serve the student details page
// app.get('/student/:rollNumber', async (req, res) => {
//     const rollNumber = req.params.rollNumber;

//     try {
//         await client.connect();
//         const database = client.db('LibraryMan');
//         const collection = database.collection('studentss');
//         const student = await collection.findOne({ studentRollNumber: rollNumber });

//         if (!student) {
//             return res.status(404).json({ error: 'Student not found.' });
//         }

//         // Send student data as JSON response
//         // res.json(student);

//         res.sendFile(__dirname + '/student.html');
//     } catch (error) {
//         console.error('Error retrieving student data:', error);
//         res.status(500).json({ error: 'Error retrieving student data: ' + error.message });
//     } finally {
//         await client.close();
//     }
// });


// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


