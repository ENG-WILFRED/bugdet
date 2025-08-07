'use client';

import { SetStateAction, useState } from 'react';
import { login } from '../../../actions/login';
import { Input, Button } from '../../components/ui';
import { User, Lock, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [cardVisible, setCardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setTimeout(() => setCardVisible(true), 100);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setToast(null);
    try {
      const user = await login(name, password);
      localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage
      setToast({ message: 'Login successful 🎉', type: 'success' });
      router.push('/dashboard'); // Redirect to dashboard
    } catch (e) {
      setToast({ message: `Invalid credentials ${e}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success"
              ? "linear-gradient(90deg, #22c55e 0%, #bef264 100%)"
              : "linear-gradient(90deg, #ef4444 0%, #fbbf24 100%)",
            color: "#1e293b",
            padding: "1rem 2rem",
            borderRadius: "1rem",
            fontWeight: 600,
            fontSize: "1.1rem",
            zIndex: 1000,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            transition: "opacity 0.4s",
          }}
        >
          {toast.message}
        </div>
      )}

      <div
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #0ea5e9 100%)",
          borderRadius: "2rem",
          boxShadow: "0 10px 40px rgba(30,64,175,0.25)",
          padding: "3rem 2rem",
          width: "100%",
          maxWidth: "28rem",
          minHeight: "38rem",
          textAlign: "center",
          color: "#f1f5f9",
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <PartyPopper size={48} color="#fbbf24" style={{ margin: "0 auto 1rem auto" }} />
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fbbf24", marginBottom: "0.5rem", letterSpacing: "-1px" }}>
          Welcome brothers
        </h1>
        <p style={{ color: "#bae6fd", marginBottom: "2rem", fontSize: "1.1rem" }}>
          Plan together. Create my university budget, one item at a time.
        </p>

        <div style={{ marginBottom: "1.2rem", position: "relative" }}>
          <User size={20} color="#38bdf8" style={{ position: "absolute", left: 12, top: 14 }} />
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setName(e.target.value)}
            style={{
              paddingLeft: "2.5rem",
              marginBottom: 0,
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#f1f5f9",
              height: "2.8rem",
              fontSize: "1rem",
              borderRadius: "0.75rem",
            }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: "2rem", position: "relative" }}>
          <Lock size={20} color="#38bdf8" style={{ position: "absolute", left: 12, top: 14 }} />
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              paddingLeft: "2.5rem",
              marginBottom: 0,
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#f1f5f9",
              height: "2.8rem",
              fontSize: "1rem",
              borderRadius: "0.75rem",
            }}
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #fbbf24 0%, #38bdf8 100%)",
            color: "#1e293b",
            padding: "0.9rem",
            borderRadius: "0.75rem",
            fontWeight: 700,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1.1rem",
            boxShadow: "0 2px 8px rgba(59,130,246,0.15)",
            marginBottom: "1.5rem",
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          disabled={loading}
        >
          {loading && (
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 22,
                border: "3px solid #bae6fd",
                borderTop: "3px solid #fbbf24",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          {loading ? "Logging in..." : "Log In"}
        </Button>
        <div style={{ marginTop: "auto", color: "#bae6fd", fontSize: "0.95rem" }}>
          <span>Need an account? </span>
          <span style={{ color: "#fbbf24", fontWeight: 600, cursor: "pointer" }}>Sign up</span>
        </div>
      </div>
      {/* Spinner animation keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}
