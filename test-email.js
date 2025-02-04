require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    try {
        // Test main email
        const mainResult = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: 'Test Email - Portfolio Contact Form',
            html: `
                <h2>Test Email</h2>
                <p>This is a test email to verify the contact form functionality.</p>
                <p>If you receive this, the email service is working correctly!</p>
                <p>Timestamp: ${new Date().toLocaleString()}</p>
            `
        });
        console.log('Main test email sent successfully!', mainResult.messageId);

        // Test auto-reply
        const autoReplyResult = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: 'Auto-Reply Test - Thank you for testing!',
            html: `
                <h2>Auto-Reply Test</h2>
                <p>This is a test of the auto-reply functionality.</p>
                <p>If you receive this, both email types are working!</p>
                <p>Timestamp: ${new Date().toLocaleString()}</p>
            `
        });
        console.log('Auto-reply test email sent successfully!', autoReplyResult.messageId);

    } catch (error) {
        console.error('Error sending test email:', error);
    }
}

testEmail(); 