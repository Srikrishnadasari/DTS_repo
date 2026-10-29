const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, PNG and JPG files are allowed."));
        }
    }
});
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// SMTP
// --------------------------------------------------

const smtpUser =
    process.env.SMTP_USER || process.env.SMTP_SENDER_EMAIL;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure:
        String(process.env.SMTP_SECURE || "true").toLowerCase() ===
        "true",
    auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS
    }
});

const senderEmail =
    process.env.SMTP_SENDER_EMAIL || smtpUser;

// --------------------------------------------------
// Test route
// --------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DTS Backend is running"
    });
});

// --------------------------------------------------
// Contact form
// --------------------------------------------------

app.post("/api/contact", async (req, res) => {

    try {

        const {
            fname,
            phone,
            email,
            service,
            message
        } = req.body;

        // ------------------------------------------
        // Validation
        // ------------------------------------------

        if (!fname || !phone || !email || !message) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }

        // Basic email validation
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });

        }

        // ------------------------------------------
        // Send email using SMTP
        // ------------------------------------------

        const result =
            await transporter.sendMail({

                from: {
                    name: "DTS - Diesel Technical Solution",
                    address: senderEmail
                },

                to: [
                    {
                        address: process.env.RECEIVER_EMAIL,
                        name: "DTS"
                    }
                ],

                replyTo: {
                    email: email,
                    name: fname
                },

                subject:
                    `New Website Enquiry - ${service || "General Enquiry"}`,

                html: `

                    <!DOCTYPE html>

                    <html>

                    <head>

                        <meta charset="UTF-8">

                        <style>

                            body {
                                font-family: Arial, sans-serif;
                                background: #f5f7fa;
                                padding: 20px;
                                color: #13213a;
                            }

                            .container {
                                max-width: 650px;
                                margin: auto;
                                background: white;
                                border-radius: 10px;
                                overflow: hidden;
                                box-shadow:
                                    0 5px 20px
                                    rgba(0,0,0,0.08);
                            }

                            .header {
                                background: #0a1a33;
                                color: white;
                                padding: 25px;
                            }

                            .header h2 {
                                margin: 0;
                            }

                            .content {
                                padding: 25px;
                            }

                            .row {
                                margin-bottom: 18px;
                            }

                            .label {
                                font-weight: bold;
                                color: #0a1a33;
                                margin-bottom: 5px;
                            }

                            .value {
                                background: #f7f8fb;
                                padding: 12px;
                                border-radius: 6px;
                            }

                            .message {
                                white-space: pre-wrap;
                            }

                            .footer {
                                background: #f7f8fb;
                                padding: 15px 25px;
                                font-size: 13px;
                                color: #68758c;
                            }

                        </style>

                    </head>

                    <body>

                        <div class="container">

                            <div class="header">

                                <h2>
                                    New Contact Form Enquiry
                                </h2>

                                <p>
                                    DTS - Diesel Technical Solution
                                </p>

                            </div>

                            <div class="content">

                                <div class="row">

                                    <div class="label">
                                        Full Name
                                    </div>

                                    <div class="value">
                                        ${escapeHtml(fname)}
                                    </div>

                                </div>


                                <div class="row">

                                    <div class="label">
                                        Phone Number
                                    </div>

                                    <div class="value">
                                        ${escapeHtml(phone)}
                                    </div>

                                </div>


                                <div class="row">

                                    <div class="label">
                                        Email Address
                                    </div>

                                    <div class="value">
                                        ${escapeHtml(email)}
                                    </div>

                                </div>


                                <div class="row">

                                    <div class="label">
                                        Service Needed
                                    </div>

                                    <div class="value">
                                        ${escapeHtml(
                                            service ||
                                            "Not specified"
                                        )}
                                    </div>

                                </div>


                                <div class="row">

                                    <div class="label">
                                        Message
                                    </div>

                                    <div class="value message">
                                        ${escapeHtml(message)}
                                    </div>

                                </div>

                            </div>

                            <div class="footer">

                                This enquiry was submitted through
                                the DTS website.

                            </div>

                        </div>

                    </body>

                    </html>

                `,

                text: `
New Contact Form Enquiry
DTS - Diesel Technical Solution

Full Name:
${fname}

Phone:
${phone}

Email:
${email}

Service:
${service || "Not specified"}

Message:
${message}
                `
            });

        console.log(
            "Email sent successfully:",
            result.messageId
        );

        // ------------------------------------------
        // Success response
        // ------------------------------------------

        res.status(200).json({

            success: true,

            message:
                "Your message has been sent successfully."

        });

    } catch (error) {

        console.error(
            "SMTP Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to send your message. Please try again later."

        });

    }

});

// --------------
app.post("/api/quote", upload.single("document"), async (req, res) => {
    try {
        const {
            fullName,
            companyName,
            email,
            phone,
            service,
            equipmentType,
            engineModel,
            location,
            requirements
        } = req.body;

        // Required field validation
        if (
            !fullName ||
            !companyName ||
            !email ||
            !phone ||
            !service ||
            !equipmentType ||
            !location ||
            !requirements
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        const emailHtml = `
            <h2>New Quote Request - DTS Website</h2>

            <h3>Customer Details</h3>

            <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Company Name:</strong> ${escapeHtml(companyName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Service Required:</strong> ${escapeHtml(service)}</p>
            <p><strong>Engine / Equipment Type:</strong> ${escapeHtml(equipmentType)}</p>
            <p><strong>Engine Model / Make:</strong> ${escapeHtml(engineModel || "Not provided")}</p>
            <p><strong>Location:</strong> ${escapeHtml(location)}</p>

            <h3>Project / Requirement Details</h3>
            <p>${escapeHtml(requirements).replace(/\n/g, "<br>")}</p>

            ${
                req.file
                    ? `<p><strong>Attached Document:</strong> ${escapeHtml(req.file.originalname)}</p>`
                    : `<p><strong>Attached Document:</strong> No document uploaded</p>`
            }
        `;

        const emailText = `
New Quote Request - DTS Website

Full Name: ${fullName}
Company Name: ${companyName}
Email: ${email}
Phone: ${phone}
Service Required: ${service}
Engine / Equipment Type: ${equipmentType}
Engine Model / Make: ${engineModel || "Not provided"}
Location: ${location}

Project / Requirement Details:
${requirements}

Attached Document:
${req.file ? req.file.originalname : "No document uploaded"}
`;

        const emailData = {
            from: {
                name: "DTS - Diesel Technical Solution",
                address: senderEmail
            },

            to: [
                {
                    address: process.env.RECEIVER_EMAIL,
                    name: "DTS"
                }
            ],

            replyTo: {
                email: email,
                name: fullName
            },

            subject: `New Quote Request - ${service}`,

            html: emailHtml,

            text: emailText
        };

        // Add uploaded document if provided
        if (req.file) {
            emailData.attachments = [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer
                }
            ];
        }

        await transporter.sendMail(emailData);

        res.status(200).json({
            success: true,
            message: "Quote request sent successfully."
        });

    } catch (error) {
        console.error("Quote Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send quote request."
        });
    }
});
// --------------------------------------------------
// Escape HTML
// Prevent user input from becoming HTML
// --------------------------------------------------

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `DTS Backend running on http://localhost:${PORT}`
    );

});