"use server";

export async function initiateMpesa(formData: FormData) {
  'use server';
  try {
    const amountRaw = formData.get('amount');
    const phoneRaw = formData.get('phone');
    const amount = Number(amountRaw);
    const phone = String(phoneRaw);
    if (!amount || !phone) return { ok: false, error: 'Missing amount or phone' };
    const mpesa = await import('../lib/mpesa');
    const result = await mpesa.lipaNaMpesa({ amount, phone });
    return { ok: true, result };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}
