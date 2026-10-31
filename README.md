# Tradeline – shuruaati trading website (free)

## VS Code me chalane ke steps
1. Node.js (v18 ya naya) install karo: https://nodejs.org
2. Is folder ko VS Code me kholo (File > Open Folder).
3. Terminal kholo (Ctrl + `) aur likho:
       npm install
       copy .env.example .env      (Mac/Linux: cp .env.example .env)
       npm start
4. Browser me kholo: http://localhost:3000  (home page)  aur  http://localhost:3000/dashboard.html

Ye **demo mode** me chalta hai: nakli prices, nakli orders. Koi paisa ya account nahi chahiye.

## Real broker (Upstox) jodna – baad me
1. Upstox developer console me app banao, client id/secret lo. Redirect URL: http://localhost:3000/callback
2. .env me BROKER=upstox, UPSTOX_CLIENT_ID, UPSTOX_CLIENT_SECRET bharo.
3. npm start, phir dashboard par "Log in with broker" dabao.
4. Pehle sirf prices dekho. Order tab karna jab ENABLE_LIVE_ORDERS=true karo, aur chhoti quantity se.

## Zaruri safety baatein
- .env ko kabhi share ya GitHub par mat daalo. API key/secret chat me bhi mat bhejo.
- Live order endpoint ADMIN_KEY maangta hai, taaki koi aur aapke account se trade na kare.
- Broker API order ke liye static IP maang sakta hai (Zerodha jaise brokers ke liye 2026 se zaruri). Docs dekho.
- Jab dusron ko service doge to SEBI/broker ke rules (registration, algo framework) pehle kisi expert se check karo.
- upstox.js ko official docs se verify karo; ye maine test nahi kiya hai.

## Folder
server.js  · brokers/demo.js · brokers/upstox.js · public/index.html (landing) · public/dashboard.html
Naya broker jodne ke liye brokers/ me ek nayi file banao (quotes, placeOrder, isLoggedIn, live) aur .env me BROKER=<naam> likho.

## Email OTP signup (free)
- Landing page ka "Open your free account" box email par 6-digit code bhejta hai (otp.js).
- SMTP khali ho to code terminal me print hota hai (testing ke liye). Real email ke liye .env me SMTP_* bharo
  (Gmail App Password, ya Brevo/Resend ka free plan).
- Verify hone par email leads.jsonl me save hota hai. Production me ise database se badal do.
- Landing page me prices, plans aur [BRACKET] wali company details placeholder hain, unhe apni asli details se badlo.

## Pro chart + paper trading (public/chart.html)
- http://localhost:3000/chart.html : candlestick chart, timeframes (1m, 5m, 15m, 1h, 1D), EMA 20/50, RSI 14,
  candlestick patterns (doji, hammer, shooting star, bullish/bearish engulfing), crosshair, zoom (scroll), pan (drag).
- Paper trading: virtual Rs 10 lakh, buy/sell, positions and P&L. Saved only in your browser (localStorage).
- Data abhi simulated hai. Broker API jodne par yahi chart asli candles dikhayega (data source badalna hoga).
- Patterns sirf information hain, buy/sell advice nahi.
