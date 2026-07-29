const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// MYSQL CONNECTION
// ===============================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "2002",
    database: "portfolio"
});

// ===============================
// CONNECT MYSQL
// ===============================
db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Error:", err.message);
        process.exit(1);
    }

    console.log("✅ MySQL Connected");
});

// ===============================
// HOME ROUTE
// ===============================
app.get("/", (req, res) => {
    res.send("Backend Working Successfully 🚀");
});

// ===============================
// CREATE CONTACT
// ===============================
app.post("/api/contacts", (req, res) => {

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO contacts (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, subject, message], (err, result) => {

        if (err) {
            console.error("INSERT ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            id: result.insertId
        });

    });

});

// ===============================
// GET ALL CONTACTS
// ===============================
app.get("/api/contacts", (req, res) => {

    const sql = `
        SELECT id, name, email, subject, message
        FROM contacts
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("FETCH ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });

    });

});

// ===============================
// GET SINGLE CONTACT
// ===============================
app.get("/api/contacts/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM contacts WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Contact not found"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });

        }
    );

});

// ===============================
// UPDATE CONTACT
// ===============================
app.put("/api/contacts/:id", (req, res) => {

    const id = req.params.id;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        UPDATE contacts
        SET
            name = ?,
            email = ?,
            subject = ?,
            message = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, email, subject, message, id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Contact not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Contact updated successfully"
            });

        }
    );

});

// ===============================
// DELETE CONTACT
// ===============================
app.delete("/api/contacts/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM contacts WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Contact not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Contact deleted successfully"
            });

        }
    );

});

// ===============================
// 404 ROUTE
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`🚀 Server running at https://localhost:${PORT}`);
});