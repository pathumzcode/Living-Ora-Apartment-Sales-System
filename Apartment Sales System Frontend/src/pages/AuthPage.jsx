import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

const initialForm = { role: 'CUSTOMER', firstName: '', lastName: '', nic: '', phoneNumber: '', address: '', age: '', email: '', password: '' };
const internalDashboards = {
  SALES_MANAGER: 'sales-dashboard',
  MARKETING_MANAGER: 'marketing-dashboard',
  CUSTOMER_RELATIONS_OFFICER: 'customer-relations-dashboard',
  FINANCE_PAYMENTS_OFFICER: 'finance-dashboard',
  PROPERTY_DEVELOPMENT_MANAGER: 'property-development-dashboard',
  OPERATIONS_DIRECTOR: 'operations-dashboard'
};
const dashboardForRole = (role) => {
  if (role === 'ADMIN') return 'admin-dashboard';
  if (role === 'SALES_AGENT') return 'external';
  if (role === 'CUSTOMER') return 'customer-dashboard';
  return internalDashboards[role] || 'internal-dashboard';
};

export const AuthPage = ({ setActivePage }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const result = mode === 'login' ? await login(form.email, form.password) : await signup({ ...form, age: Number(form.age) });
      setMessage(mode === 'login' ? 'You are signed in to Living-Ora.' : 'Account created successfully.');
      window.setTimeout(() => setActivePage(dashboardForRole(result.user.role)), 500);
    } catch (err) { setError(err.message || 'Unable to complete this request.'); } finally { setBusy(false); }
  };
  const isSignup = mode === 'signup';
  return <div className="auth-page animate-fade-in"><div className="auth-ambient auth-ambient-one" /><div className="auth-ambient auth-ambient-two" /><div className="auth-stage"><div className="auth-visual"><div className="auth-visual-image" /><div className="auth-visual-copy"><span>Living-Ora / 2026</span><strong>Find a home<br />that feels like yours.</strong><small>Verified residences · Colombo</small></div><div className="auth-floating-card"><span>Featured residence</span><b>Ora Grand Residences</b><small>Ocean-facing · From $120,000</small></div></div><div className="auth-panel">
    <div className="auth-mark"><Building2 size={22} /></div><div className="auth-kicker">Living-Ora Residences</div>
    <div className="auth-heading"><h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1><p>{isSignup ? 'Join Living-Ora as a customer or sales agent.' : 'Use your email and password to sign in. Internal staff can use their Living-Ora business email to open their role dashboard.'}</p></div>
    <div className="auth-tabs" role="tablist"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Login</button><button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Sign up</button></div>
    {message && <div className="auth-success"><CheckCircle2 size={18} /> {message}</div>}{error && <div className="auth-error"><AlertCircle size={18} /> {error}</div>}
    <form onSubmit={submit}>
      {isSignup && <div className="form-group auth-field"><label className="form-label">Account type</label><select className="form-input auth-input" value={form.role} onChange={update('role')} required><option value="CUSTOMER">Customer</option><option value="SALES_AGENT">Sales Agent</option></select></div>}
      {isSignup && <><div className="auth-form-grid"><div className="form-group auth-field"><label className="form-label">First name</label><input className="form-input auth-input" value={form.firstName} onChange={update('firstName')} required /></div><div className="form-group auth-field"><label className="form-label">Last name</label><input className="form-input auth-input" value={form.lastName} onChange={update('lastName')} required /></div><div className="form-group auth-field"><label className="form-label">NIC</label><input className="form-input auth-input" value={form.nic} onChange={update('nic')} required /></div><div className="form-group auth-field"><label className="form-label">Age</label><input type="number" min="18" max="120" className="form-input auth-input" value={form.age} onChange={update('age')} required /></div></div><div className="form-group auth-field"><label className="form-label">Phone number</label><input className="form-input auth-input" value={form.phoneNumber} onChange={update('phoneNumber')} required /></div><div className="form-group auth-field"><label className="form-label">Address</label><input className="form-input auth-input" value={form.address} onChange={update('address')} required /></div></>}
      <div className="form-group auth-field"><label className="form-label">{isSignup ? 'Email address' : 'Email address / business email'}</label><input type="email" className="form-input auth-input" value={form.email} onChange={update('email')} required /></div><div className="form-group auth-field"><label className="form-label">Password</label><input type="password" minLength="8" className="form-input auth-input" value={form.password} onChange={update('password')} required /></div>
      <button type="submit" className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Continue to Living-Ora'} <ArrowRight size={18} /></button>
    </form>
  </div></div></div>;
};
