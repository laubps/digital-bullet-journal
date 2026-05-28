'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RainCanvas from './RainCanvas';
import PageBackground from '@/components/PageBackground';
import { C, T, mono, script } from '@/lib/ui/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError('please enter your email');
    if (!EMAIL_REGEX.test(trimmedEmail)) return setError("hmm, that doesn't look like an email");
    if (!password) return setError('please enter your password');
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'something went wrong, try again');
        setLoading(false);
        return;
      }
      setSubmitted(true);
      const from = searchParams.get('from');
      const dest = from && from.startsWith('/') ? from : '/dashboard';
      setTimeout(() => router.push(dest), 800);
    } catch {
      setError('connection error, try again');
      setLoading(false);
    }
  };

  const pageStyle: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  const outerCardStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '656px',
    background: C.outerCard,
    borderRadius: '14px',
    padding: '10px',
    boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0) rotate(-0.5deg)' : 'translateY(16px) rotate(-0.5deg)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  };

  const innerCardStyle: CSSProperties = {
    width: '100%',
    minHeight: '420px',
    background: C.cardBg,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle: CSSProperties = {
    background: C.headerBg,
    margin: '6px',
    borderRadius: '4px 4px 0 0',
    padding: '18px 32px 18px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  };

  const titleStyle: CSSProperties = T.brandTitle(52);

  const stampBoxStyle: CSSProperties = {
    width: '72px',
    height: '64px',
    border: `1.5px solid ${C.darkPink}`,
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const bodyStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    position: 'relative',
    borderTop: `1px solid ${C.lineColor}`,
  };

  const leftPanelStyle: CSSProperties = {
    width: '45%',
    padding: '32px 28px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
  };

  const dividerStyle: CSSProperties = {
    width: '1px',
    background: C.lineColor,
    alignSelf: 'stretch',
  };

  const rightPanelStyle: CSSProperties = {
    flex: 1,
    padding: '32px 32px 24px 28px',
    display: 'flex',
    flexDirection: 'column',
  };

  const verticalSideStyle: CSSProperties = {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%) rotate(-90deg)',
    transformOrigin: 'left center',
    fontFamily: mono,
    fontSize: '7px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: C.textSubtle,
    whiteSpace: 'nowrap',
  };

  const quoteStyle: CSSProperties = T.quote();

  const labelTiny: CSSProperties = T.label();

  const labelLogIn: CSSProperties = {
    ...labelTiny,
    color: C.lineColor,
    letterSpacing: '0.18em',
    fontSize: '12px',
    marginBottom: '24px',
  };

  const inputWrapStyle: CSSProperties = {
    position: 'relative',
    marginBottom: '20px',
  };

  const inputLabelStyle = (focused: boolean): CSSProperties => ({
    fontFamily: mono,
    fontSize: '9px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: focused ? C.lineColor : C.textSecondary,
    transition: 'color 0.2s ease',
    display: 'block',
    marginBottom: '6px',
  });

  const inputStyle = (focused: boolean): CSSProperties => ({
    width: '100%',
    height: '36px',
    border: 'none',
    borderBottom: `1.5px solid ${focused ? C.inputBorderFocus : C.inputBorderDefault}`,
    background: 'transparent',
    outline: 'none',
    fontFamily: mono,
    fontSize: '14px',
    letterSpacing: '0.02em',
    color: C.textPrimary,
    transition: 'border-bottom-color 0.25s ease',
    padding: '0 0 4px 0',
  });

  const showHideStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: '8px',
    fontFamily: mono,
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    height: '44px',
    background: btnHover ? C.btnHover : C.btnColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontFamily: mono,
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: loading ? 'wait' : 'pointer',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
    boxShadow: btnHover ? '0 3px 12px rgba(232,169,198,0.35)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const signupStyle: CSSProperties = {
    fontFamily: mono,
    fontSize: '10px',
    letterSpacing: '0.06em',
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: '14px',
  };

  const signupLinkStyle: CSSProperties = {
    color: C.darkPink,
    borderBottom: '1px solid rgba(131,22,51,0.3)',
    textDecoration: 'none',
    paddingBottom: '1px',
  };

  const errorStyle: CSSProperties = {
    fontFamily: mono,
    fontSize: '11px',
    color: C.darkPink,
    marginTop: '4px',
    marginBottom: '8px',
    animation: 'petal-shake 0.3s ease',
  };

  const spinnerStyle: CSSProperties = {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'petal-spin 0.7s linear infinite',
  };

  return (
    <main style={pageStyle}>
      <PageBackground videoSrc="/videos/8114287-uhd_4096_2160_25fps.mp4" />
      <RainCanvas />

      <div style={outerCardStyle}>
        <div style={innerCardStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={titleStyle}>Petal</div>
            <div style={stampBoxStyle}>
              <svg width="28" height="26" viewBox="0 0 24 22" fill={C.darkPink} style={{ opacity: 0.8 }}>
                <path d="M12 21s-7.5-4.7-10-9.2C0 8 1.8 4 5.5 4c2 0 3.6 1 4.5 2.5C10.9 5 12.5 4 14.5 4 18.2 4 20 8 18 11.8 17.5 16.3 12 21 12 21z" />
              </svg>
            </div>
          </div>

          {/* Body */}
          <div style={bodyStyle}>
            <div style={verticalSideStyle}>Digital Journal</div>

            {!submitted ? (
              <>
                {/* Left panel — quote */}
                <div style={leftPanelStyle}>
                  <div style={{ marginTop: '8px' }}>
                    <div style={quoteStyle}>
                      <div style={{ marginBottom: '12px' }}>your emotions</div>
                      <div style={{ marginBottom: '12px' }}>are waiting…</div>
                      <div>don&apos;t avoid them</div>
                    </div>
                    <div style={{ marginTop: '18px', color: C.darkPink, fontSize: '24px' }}>♥</div>
                  </div>
                  <div style={{ ...labelTiny, color: C.textSecondary }}>
                    From:&nbsp;<span style={{ color: C.darkPink }}>Petal</span>
                  </div>
                </div>

                <div style={dividerStyle} />

                {/* Right panel — form */}
                <div style={rightPanelStyle}>
                  <div style={labelLogIn}>Log In</div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div style={inputWrapStyle}>
                      <label htmlFor="email" style={inputLabelStyle(emailFocus)}>Email</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                        style={inputStyle(emailFocus)}
                        autoComplete="email"
                      />
                    </div>

                    <div style={inputWrapStyle}>
                      <label htmlFor="password" style={inputLabelStyle(passwordFocus)}>Password</label>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                        style={inputStyle(passwordFocus)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        style={showHideStyle}
                        tabIndex={-1}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {error && <div style={errorStyle}>{error}</div>}

                    <div style={{ flex: 1, minHeight: '24px' }} />

                    <button
                      type="submit"
                      disabled={loading}
                      onMouseEnter={() => setBtnHover(true)}
                      onMouseLeave={() => setBtnHover(false)}
                      style={buttonStyle}
                    >
                      {loading ? (
                        <>
                          <span style={spinnerStyle} />
                          <span>Opening…</span>
                        </>
                      ) : (
                        'Enter Journal'
                      )}
                    </button>

                    <div style={signupStyle}>
                      new here?{' '}
                      <a href="/signup" style={signupLinkStyle}>start your journal</a>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'petal-fade-up 0.5s ease',
                }}
              >
                <div style={{ fontFamily: script, fontSize: '36px', color: C.textPrimary }}>
                  welcome back
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: C.textSecondary,
                    marginTop: '12px',
                  }}
                >
                  your journal is ready
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
