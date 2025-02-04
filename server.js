require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email templates
const mainEmailTemplate = (name, email, subject, message) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4338ca; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .field { margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; }
            .field strong { color: #4338ca; }
            .message-box { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
            .icon { font-size: 24px; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="icon">📨</div>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <strong>👤 Name:</strong> ${name}
            </div>
            <div class="field">
                <strong>📧 Email:</strong> ${email}
            </div>
            <div class="field">
                <strong>📝 Subject:</strong> ${subject || 'Not specified'}
            </div>
            <div class="message-box">
                <strong>💬 Message:</strong>
                <p>${message}</p>
            </div>
            <div class="footer">
                <p>This message was sent from your portfolio contact form.</p>
                <p>© ${new Date().getFullYear()} Telvin Teum - Full Stack Developer</p>
            </div>
        </div>
    </body>
    </html>
`;

const autoReplyTemplate = (name) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4338ca, #6366f1); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .greeting { font-size: 1.2em; color: #4338ca; margin-bottom: 20px; }
            .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .social-links { text-align: center; margin-top: 20px; }
            .social-links a { margin: 0 10px; color: #4338ca; text-decoration: none; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.9em; }
            .icon { font-size: 40px; margin-bottom: 15px; }
            .button { display: inline-block; padding: 12px 25px; background: #4338ca; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="icon">👋</div>
            <h2>Thank You for Reaching Out!</h2>
        </div>
        <div class="content">
            <div class="greeting">Hello ${name},</div>
            <div class="message">
                <p>Thank you for contacting me! I've received your message and will get back to you as soon as possible.</p>
                <p>In the meantime, feel free to:</p>
                <ul>
                    <li>Check out my GitHub repositories</li>
                    <li>Connect with me on LinkedIn</li>
                    <li>Follow me on Twitter</li>
                </ul>
            </div>
            <div style="text-align: center;">
                <a href="https://github.com/BotCoder254" class="button">View My Projects</a>
            </div>
            <div class="social-links">
                <a href="https://github.com/BotCoder254">📚 GitHub</a>
                <a href="#">💼 LinkedIn</a>
                <a href="#">🐦 Twitter</a>
            </div>
            <div class="footer">
                <p>Best regards,<br><strong>Telvin Teum</strong><br>Full Stack Developer</p>
                <p>© ${new Date().getFullYear()} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
`;

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please fill in all required fields' });
        }

        // Main email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: `Portfolio Contact: ${subject || 'New Message'}`,
            html: mainEmailTemplate(name, email, subject, message)
        };

        // Auto-reply email
        const autoReplyOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting me! 👋',
            html: autoReplyTemplate(name)
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(mailOptions),
            transporter.sendMail(autoReplyOptions)
        ]);

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

const GITHUB_USERNAME = 'BotCoder254';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Configure axios defaults for GitHub API
const githubApi = axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
    }
});

// Cache for GitHub data
let githubCache = {
    user: null,
    repos: null,
    timestamp: null
};

// Cache duration (1 hour)
const CACHE_DURATION = 3600000;

// Check if cache is valid
const isCacheValid = () => {
    return githubCache.timestamp && (Date.now() - githubCache.timestamp < CACHE_DURATION);
};

// Fetch GitHub user data
app.get('/api/github/user', async (req, res) => {
    try {
        if (isCacheValid() && githubCache.user) {
            return res.json(githubCache.user);
        }

        const response = await githubApi.get(`/users/${GITHUB_USERNAME}`);
        
        githubCache.user = response.data;
        githubCache.timestamp = Date.now();
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching GitHub user:', error);
        res.status(500).json({ error: 'Failed to fetch GitHub user data' });
    }
});

// Fetch all repositories
app.get('/api/github/repos', async (req, res) => {
    try {
        if (isCacheValid() && githubCache.repos) {
            return res.json(githubCache.repos);
        }

        const perPage = 100;
        let page = 1;
        let allRepos = [];

        while (true) {
            const response = await githubApi.get(`/users/${GITHUB_USERNAME}/repos`, {
                params: {
                    per_page: perPage,
                    page: page,
                    sort: 'updated'
                }
            });

            const repos = response.data;
            if (!repos || repos.length === 0) break;

            const filteredRepos = repos.filter(repo => !repo.fork);
            allRepos = allRepos.concat(filteredRepos);

            if (repos.length < perPage) break;
            page++;

            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        githubCache.repos = allRepos;
        githubCache.timestamp = Date.now();

        res.json(allRepos);
    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).json({ error: 'Failed to fetch GitHub repositories' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 