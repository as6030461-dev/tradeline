// Email OTP (free): Gmail App Password ya Brevo/Resend ka free SMTP use kar sakte ho.
// SMTP set nahi hai to OTP terminal me print hota hai (sirf development ke liye).
const crypto = require('crypto');
const fs = require('fs');
const nodemailer = require('nodemailer');
const E = process.env;
const store = new Map();   // email -> { code, exp, tries, last }
const ipHits = new Map();  // ip -> [timestamps]
const mailer = E.SMTP_HOST ? nodemailer.createTransport({
  host: E.SMTP_HOST, port: +(E.SMTP_PORT || 465), secure: +(E.SMTP_PORT || 465) === 465,
  auth: { user: E.SMTP_USER, pass: E.SMTP_PASS } }) : null;
const okEmail = e => typeof e === 'string' && e.length < 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

module.exports = (app) => {
  app.post('/api/otp/send', async (req, res) => {
    const email = String((req.body || {}).email || '').toLowerCase();
    if (!okEmail(email)) return res.status(400).json({ error: 'Valid email daalo.' });
    const now = Date.now(), hits = (ipHits.get(req.ip) || []).filter(t => now - t < 3600e3);
    if (hits.length >= 10) return res.status(429).json({ error: 'Bahut zyada koshish. Thodi der baad try karo.' });
    const old = store.get(email);
    if (old && now - old.last < 30e3) return res.status(429).json({ error: '30 second baad dobara try karo.' });
    hits.push(now); ipHits.set(req.ip, hits);
    const code = String(crypto.randomInt(100000, 1000000));
    store.set(email, { code, exp: now + 5 * 60e3, tries: 0, last: now });
    try {
      if (mailer) await mailer.sendMail({ from: E.MAIL_FROM || E.SMTP_USER, to: email,
        subject: 'Your Tradeline verification code',
        text: 'Your code is ' + code + '. It expires in 5 minutes. If you did not request it, ignore this email.' });
      else console.log('[DEV] OTP for ' + email + ': ' + code);
      res.json({ ok: true, dev: !mailer });
    } catch (e) { console.error(e.message); res.status(500).json({ error: 'Email bhejne me dikkat aayi. SMTP settings check karo.' }); }
  });

  app.post('/api/otp/verify', (req, res) => {
    const email = String((req.body || {}).email || '').toLowerCase(), code = String((req.body || {}).code || '');
    const r = store.get(email);
    if (!r || Date.now() > r.exp) return res.status(400).json({ error: 'Code expire ho gaya. Naya code mangao.' });
    if (++r.tries > 5) { store.delete(email); return res.status(429).json({ error: 'Bahut galat koshish. Naya code mangao.' }); }
    const a = Buffer.from(code), b = Buffer.from(r.code);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ error: 'Galat code.' });
    store.delete(email);
    fs.appendFileSync('leads.jsonl', JSON.stringify({ email, at: new Date().toISOString() }) + '\n');
    res.json({ ok: true });
  });
};
