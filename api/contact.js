// ──────────────────────────────────────────────────────────────────────────
// DIRECT RESEND EMAIL API DISPATCHER FOR CONTACT BOARD
// ──────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const TO_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || 'subhamsaantra001@gmail.com';

export async function handleContactRequest(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const body = await parseBody(req);
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Please provide name, email, and message.' }));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid email address provided.' }));
      return;
    }

    const emailSubject = subject ? `[Portfolio] ${subject}` : `[Portfolio] New message from ${name}`;

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #1a1612; margin: 0; padding: 24px; color: #f4eee2; }
    .card { background-color: #241c15; border: 2px solid #5a4128; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #7c4c24 0%, #4a2c11 100%); padding: 20px 24px; border-bottom: 2px solid #5a4128; }
    .header h1 { margin: 0; font-size: 20px; color: #ffd276; letter-spacing: 0.05em; font-family: monospace; }
    .header p { margin: 4px 0 0 0; font-size: 13px; color: #e8d0ba; }
    .body-content { padding: 24px; }
    .meta-row { display: flex; margin-bottom: 12px; border-bottom: 1px dashed #423020; padding-bottom: 10px; }
    .meta-label { font-weight: bold; color: #ffd276; width: 90px; font-size: 13px; text-transform: uppercase; font-family: monospace; }
    .meta-value { color: #f4eee2; font-size: 14px; flex: 1; }
    .meta-value a { color: #5af78e; text-decoration: none; }
    .message-box { background-color: #140e0a; border: 1px solid #4a3420; border-radius: 8px; padding: 18px; margin-top: 18px; }
    .message-title { font-size: 12px; font-weight: bold; color: #e59a38; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; font-family: monospace; }
    .message-text { font-size: 15px; line-height: 1.6; color: #fff; white-space: pre-wrap; margin: 0; }
    .footer { background-color: #18120e; padding: 14px 24px; font-size: 12px; color: #8c735d; text-align: center; border-top: 1px solid #3d2b1a; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>✉️ NEW PORTFOLIO TRANSMISSION</h1>
      <p>Received via 3D Interactive Studio Contact Board</p>
    </div>
    <div class="body-content">
      <div class="meta-row">
        <span class="meta-label">FROM:</span>
        <span class="meta-value"><strong>${escapeHtml(name)}</strong></span>
      </div>
      <div class="meta-row">
        <span class="meta-label">REPLY-TO:</span>
        <span class="meta-value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></span>
      </div>
      ${subject ? `
      <div class="meta-row">
        <span class="meta-label">SUBJECT:</span>
        <span class="meta-value">${escapeHtml(subject)}</span>
      </div>` : ''}
      <div class="meta-row">
        <span class="meta-label">DATE:</span>
        <span class="meta-value">${new Date().toUTCString()}</span>
      </div>

      <div class="message-box">
        <div class="message-title">MESSAGE PAYLOAD:</div>
        <p class="message-text">${escapeHtml(message)}</p>
      </div>
    </div>
    <div class="footer">
      Subham Santra Portfolio · Powered by Resend API
    </div>
  </div>
</body>
</html>
    `;

    // Send via Resend REST API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: email,
        subject: emailSubject,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Resend API Error]', resendData);
      res.statusCode = resendResponse.status;
      res.end(JSON.stringify({ error: resendData.message || 'Failed to send email via Resend' }));
      return;
    }

    console.log('[Resend API Success] Email sent ID:', resendData.id);
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, id: resendData.id }));
  } catch (err) {
    console.error('[Contact API Error]', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_) {
        resolve({});
      }
    });
  });
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

export default handleContactRequest;
