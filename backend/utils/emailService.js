const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
    },
});

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
exports.sendNotificationEmail = async (to, subject, html) => {
    if (!to) {
        console.error("❌ EMAIL SERVICE: No recipient defined.");
        return;
    }

    // Check credentials exist
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error("❌ EMAIL SERVICE: Missing credentials in .env (GMAIL_USER or GMAIL_PASS).");
        return;
    }

    console.log(`📧 EMAIL SERVICE: Attempting to send email to [${to}]...`);

    try {
        const info = await transporter.sendMail({
            from: `"Donation Manager" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`✅ EMAIL SERVICE: Success! Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("❌ EMAIL SERVICE: Failed to send email.");
        console.error(`   Error: ${error.message}`);
        // Return null/false but DO NOT THROW, preventing main flow blockage
        return null;
    }
};
