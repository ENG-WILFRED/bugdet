'use client';

import { useState } from 'react';
import { register } from '../../../actions/register';
import { Input, Button } from '../components/ui';
import { User, Lock, Mail, Phone, MapPin, Globe, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  const [cardVisible, setCardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setTimeout(() => setCardVisible(true), 100);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setLoading(true);
    setToast(null);
    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Username is required');
      }
      if (!formData.password.trim()) {
        throw new Error('Password is required');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const user = await register({
        name: formData.name,
        password: formData.password,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
      });

      localStorage.setItem("user", JSON.stringify(user));
      setToast({ message: 'Registration successful! Redirecting...', type: 'success' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e) {
      setToast({ message: `Registration failed: ${e instanceof Error ? e.message : String(e)}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/finance-bg.svg')] bg-cover bg-center flex items-center justify-center">
      {/* Toast */}
      {toast && (
        <div
          className={
            'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-semibold text-lg shadow-lg ' +
            (toast.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-lime-300 text-slate-900' : 'bg-gradient-to-r from-rose-500 to-yellow-400 text-slate-900')
          }
        >
          {toast.message}
        </div>
      )}

      <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl py-12 px-8 text-center text-slate-50 flex flex-col justify-start transition-all duration-700 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} bg-gradient-to-br from-sky-900/10 to-emerald-900/10`}>

        <PartyPopper size={48} className="mx-auto mb-4 text-yellow-400" />
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">Create Your Finance Account</h1>
        <p className="text-sky-100 mb-6">Sign up to track spending, set budgets, and reach your financial goals.</p>

        {/* Username */}
        <div className="mb-4 relative">
          <User size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="text"
            name="name"
            placeholder="Username"
            value={formData.name}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="mb-4 relative">
          <Mail size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <Lock size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <Lock size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div className="mb-4 relative">
          <Phone size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="tel"
            name="phone"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Address */}
        <div className="mb-4 relative">
          <MapPin size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="text"
            name="address"
            placeholder="Address (optional)"
            value={formData.address}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* City */}
        <div className="mb-4 relative">
          <MapPin size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="text"
            name="city"
            placeholder="City (optional)"
            value={formData.city}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Country */}
        <div className="mb-6 relative">
          <Globe size={20} className="absolute left-3 top-3 text-sky-400" />
          <Input
            type="text"
            name="country"
            placeholder="Country (optional)"
            value={formData.country}
            onChange={handleChange}
            className="pl-10 mb-0 bg-white/5 text-slate-100 h-11 text-base rounded-lg"
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleRegister}
          className="w-full bg-brand text-slate-100 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 mb-6"
          disabled={loading}
        >
          {loading ? (
            <div className="inline-block w-5 h-5 border-4 border-sky-200 border-t-yellow-400 rounded-full animate-spin" />
          ) : null}
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <div className="text-sky-100 text-sm cursor-pointer" onClick={() => router.push('/login')}>
          <span>Already have an account? </span>
          <span className="text-yellow-400 font-semibold underline">Log in</span>
        </div>
      </div>
    </div>
  );
}
