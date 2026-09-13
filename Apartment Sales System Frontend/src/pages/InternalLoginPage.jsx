import React, { useState } from 'react';
import { ArrowRight, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const dashboardForRole = (role) => role === 'ADMIN' ? 'admin-dashboard' : 'internal-dashboard';

export const InternalLoginPage = ({ setActivePage }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await login(form.email, form.password);
      setActivePage(dashboardForRole(result.user.role));
    }
    catch (err) { setError(err.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  };
  return <div className="internal-portal"><div className="internal-login-card">
    <div className="internal-lock"><ShieldCheck size={24} /></div><span className="internal-kicker">Living-Ora / Secure access</span>
    <h1>Internal staff portal</h1><p>Sign in with your Living-Ora internal account to open the dashboard for your role.</p>
    {error && <div className="auth-error"><AlertCircle size={17} /> {error}</div>}
    <form onSubmit={submit}><label className="form-group"><span className="form-label">Work email</span><input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@livingora.lk" /></label><label className="form-group"><span className="form-label">Password</span><input className="form-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></label><button className="auth-submit" disabled={busy}>{busy ? 'Checking access…' : 'Enter internal dashboard'} <ArrowRight size={17} /></button></form>
    <button className="internal-back" onClick={() => setActivePage('home')}><Building2 size={14} /> Return to public site</button>
  </div></div>;
};
