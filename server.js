 npm startrequire('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

const name = (process.env.BROKER || 'demo').toLowerCase();
const broker = require('./brokers/' + name);
const MAX_QTY = 100;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) =>
  res.json({ broker: name, live: broker.live, loggedIn: broker.isLoggedIn() }));

app.get('/api/quotes', async (req, res) => {
  try { res.json(await broker.quotes()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/order', async (req, res) => {
  const { symbol, side, qty } = req.body || {};
  const n = Number(qty);
  if (!['BUY', 'SELL'].includes(side) || !Number.isInteger(n) || n < 1 || n > MAX_QTY || !symbol)
    return res.status(400).json({ error: 'Galat order. Qty 1 se ' + MAX_QTY + ' ke beech honi chahiye.' });
  if (broker.live) {
    // Real paise wala order: sirf admin, aur sirf jab ENABLE_LIVE_ORDERS=true ho
    if (req.get('x-admin-key') !== process.env.ADMIN_KEY)
      return res.status(401).json({ error: 'Admin key galat hai.' });
    if (process.env.ENABLE_LIVE_ORDERS !== 'true')
      return res.status(403).json({ error: 'Live orders band hain (.env me ENABLE_LIVE_ORDERS=true karo).' });
  }
  try { res.json(await broker.placeOrder({ symbol, side, qty: n })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/login', (req, res) =>
  broker.loginUrl ? res.redirect(broker.loginUrl()) : res.status(400).send('Is broker me login ki zarurat nahi.'));

app.get('/callback', async (req, res) => {
  try { await broker.handleCallback(req.query.code); res.redirect('/dashboard.html'); }
  catch (e) { res.status(500).send('Login fail: ' + e.message); }
});

require('./otp')(app);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Tradeline chal raha hai: http://localhost:' + port + '  (broker: ' + name + ')'));
