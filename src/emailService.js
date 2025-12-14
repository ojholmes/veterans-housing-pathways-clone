const nodemailer = require('nodemailer');
// Optional provider web APIs
let sgMail;
try { sgMail = require('@sendgrid/mail'); } catch (e) { sgMail = null }
require('dotenv').config();

let _transporter = null;
let _isTestAccount = false;
let _lastEmailResult = null;

async function getTransporter() {
  if (_transporter) return _transporter;
  // If explicit SMTP vars provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    _isTestAccount = false;
    return _transporter;
  }

  // Auto-configure common providers if their env vars are present
  // SendGrid via SMTP (recommended): set SENDGRID_API_KEY
  if (process.env.SENDGRID_API_KEY) {
    _transporter = nodemailer.createTransport({
      host: process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net',
      port: Number(process.env.SENDGRID_SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SENDGRID_SMTP_USER || 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
    _isTestAccount = false;
    console.warn('Using SendGrid SMTP transport (SENDGRID_API_KEY detected).');
    return _transporter;
  }

  // Mailgun via SMTP: MAILGUN_SMTP_LOGIN and MAILGUN_SMTP_PASSWORD
  if (process.env.MAILGUN_SMTP_LOGIN && process.env.MAILGUN_SMTP_PASSWORD) {
    _transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
      port: Number(process.env.MAILGUN_SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD
      }
    });
    _isTestAccount = false;
    console.warn('Using Mailgun SMTP transport (MAILGUN_SMTP_LOGIN detected).');
    return _transporter;
  }

  // Create Ethereal test account for development to preview emails without credentials
  try {
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    _isTestAccount = true;
    console.warn('Using Ethereal test account for email previews. Set SMTP_* env vars to enable real sending.');
    return _transporter;
  } catch (err) {
    console.warn('Failed to create test SMTP account; emails will be logged instead.', err);
    _transporter = null;
    _isTestAccount = false;
    return null;
  }
}

async function sendNavigatorAlert({ to, clientName, clientId }) {
  const subject = `URGENT: Client ${clientName} Overdue for Contact`;
  const profileUrl = `${process.env.APP_BASE_URL || 'http://localhost:4000'}/clients/${clientId}`;
  const html = `<p>Dear Navigator,</p>
    <p>The client <strong>${clientName}</strong> has not been contacted in the last 14+ days.</p>
    <p>Please follow up as soon as possible. <a href="${profileUrl}">Open client profile</a></p>
    <p>— Veterans Housing Pathways</p>`;

  // Prefer provider web APIs when available for richer features
  if (process.env.SENDGRID_API_KEY && sgMail) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        subject
      };
      // If a SendGrid template id is provided, use it with dynamic_template_data
      if (process.env.SENDGRID_TEMPLATE_ID) {
        msg.templateId = process.env.SENDGRID_TEMPLATE_ID;
        msg.dynamic_template_data = { clientName, clientId, subject, html };
      } else {
        msg.html = html;
      }
      const resp = await sgMail.send(msg);
      console.log('Sent via SendGrid', resp && resp[0] && resp[0].statusCode);
      _lastEmailResult = { provider: 'sendgrid', resp, dynamic_template_data: msg.dynamic_template_data || null };
      return _lastEmailResult;
    } catch (err) {
      console.error('SendGrid send failed', err);
    }
  }

  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    try {
      const params = new URLSearchParams();
      params.append('from', process.env.EMAIL_FROM || 'no-reply@example.com');
      params.append('to', to);
      params.append('subject', subject);
      // If MAILGUN_TEMPLATE is set, use template and pass variables
      if (process.env.MAILGUN_TEMPLATE) {
        params.append('template', process.env.MAILGUN_TEMPLATE);
        const vars = JSON.stringify({ clientName, clientId, subject, html });
        params.append('h:X-Mailgun-Variables', vars);
      } else {
        params.append('html', html);
      }
      const auth = 'Basic ' + Buffer.from('api:' + process.env.MAILGUN_API_KEY).toString('base64');
      const resp = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const text = await resp.text();
      console.log('Mailgun response', resp.status);
      _lastEmailResult = { provider: 'mailgun', status: resp.status, body: text };
      return _lastEmailResult;
    } catch (err) {
      console.error('Mailgun send failed', err);
    }
  }

  // Fallback to SMTP/Ethereal transporter
  const transporter = await getTransporter();
  if (!transporter) {
    console.log('ALERT (logged):', { from: process.env.EMAIL_FROM, to, subject, html });
    return { logged: true };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    html
  });

  if (_isTestAccount) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Ethereal preview URL:', previewUrl);
    _lastEmailResult = { provider: 'ethereal', info, previewUrl };
    return _lastEmailResult;
  }

  _lastEmailResult = { provider: 'smtp', info };
  return _lastEmailResult;
}

function getLastEmailResult(){ return _lastEmailResult }

module.exports = { sendNavigatorAlert, getLastEmailResult };
