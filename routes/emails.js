const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Email = require('../models/Email');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 2525,
    secure: false,
    tls: {
        rejectUnauthorized: false
    }
});

// @route   POST api/emails/send
// @desc    Send an email
// @access  Private
router.post('/send', auth, async (req, res) => {
    const { to, subject, text, html } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const from = user.email;
        const fromName = user.name;

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"${fromName}" <${from}>`, // sender address with name
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
        });

        console.log('Message sent: %s', info.messageId);

        // We also want to save a copy in the "Sent" folder for the sender
        const sentEmail = new Email({
            from,
            fromName,
            to,
            subject,
            text,
            html,
            folder: 'sent',
            isRead: true
        });
        await sentEmail.save();

        res.json({ msg: 'Email sent', messageId: info.messageId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// @route   GET api/emails/inbox
// @desc    Get inbox emails
// @access  Private
router.get('/inbox', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        // Find emails where 'to' is the user's email and folder is 'inbox' (default)
        // Note: Our SMTP server saves incoming emails with folder 'inbox'
        const emails = await Email.find({ to: user.email, folder: 'inbox' }).sort({ createdAt: -1 });
        res.json(emails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/emails/sent
// @desc    Get sent emails
// @access  Private
router.get('/sent', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const emails = await Email.find({ from: user.email, folder: 'sent' }).sort({ createdAt: -1 });
        res.json(emails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
