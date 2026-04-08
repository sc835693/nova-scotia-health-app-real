require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Azure SQL connection config
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

// Connect to DB
sql.connect(dbConfig)
    .then(() => console.log("Connected to Azure SQL"))
    .catch(err => console.error("DB Connection Error:", err));

// API route
app.post('/api/appointments', async (req, res) => {
    const { firstName, lastName, healthCard } = req.body;

    try {
        const result = await sql.query`
            SELECT TOP 1 appointment_date, location
            FROM Patients
            WHERE first_name = ${firstName}
            AND last_name = ${lastName}
            AND health_card = ${healthCard}
        `;

        if (result.recordset.length === 0) {
            return res.json({
                message: "No appointment found."
            });
        }

        const appointment = result.recordset[0];

        res.json({
            message: `${firstName}, your next appointment is on ${appointment.appointment_date} at ${appointment.location}.`
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));