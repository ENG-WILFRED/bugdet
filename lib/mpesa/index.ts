// Use global fetch provided by the runtime (Next.js supports fetch on server)

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';

const SANDBOX_OAUTH = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const PROD_OAUTH = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const SANDBOX_STK = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const PROD_STK = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

async function getOAuthToken() {
  const url = MPESA_ENV === 'production' ? PROD_OAUTH : SANDBOX_OAUTH;
  const creds = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${creds}` },
  });
  if (!res.ok) throw new Error('Failed to get access token');
  const data = await res.json();
  return data.access_token as string;
}

function getTimestamp() {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}${m}${day}${hh}${mm}${ss}`;
}

export async function lipaNaMpesa({ amount, phone, accountRef, description }: { amount: number; phone: string; accountRef?: string; description?: string }) {
  const token = await getOAuthToken();
  const url = MPESA_ENV === 'production' ? PROD_STK : SANDBOX_STK;
  const timestamp = getTimestamp();
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const body = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone.replace(/[^0-9]/g, ''),
    PartyB: SHORTCODE,
    PhoneNumber: phone.replace(/[^0-9]/g, ''),
    CallBackURL: CALLBACK_URL,
    AccountReference: accountRef || 'BudgetApp',
    TransactionDesc: description || 'Payment',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data;
}

// Simple callback handler parser (the route will call this)
export async function handleCallback(payload: any) {
  // In production you would verify, persist the payment record, and update balances
  console.log('Received M-Pesa callback:', JSON.stringify(payload));
  return { received: true };
}

const mpesaModule = { lipaNaMpesa, handleCallback };
export default mpesaModule;
