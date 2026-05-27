'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundVideo from '../login/BackgroundVideo';
import RainCanvas from '../login/RainCanvas';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const C = {
  pink: '#f192b5',
  darkPink: '#831633',
  cardBg: '#ffffff',
  headerBg: '#ecd0dc',
  btnColor: '#e8a9c6',
  btnHover: '#d48aab',
  lineColor: '#2a1f24',
  outerCard: '#969753',
  bodyBg: '#252122',
  textPrimary: '#2a1f24',
  textSecondary: '#8a7068',
  textSubtle: 'rgba(131,22,51,0.2)',
  inputBorderDefault: 'rgba(42,31,36,0.25)',
  inputBorderFocus: '#2a1f24',
  overlayBg: 'rgba(20,18,18,0.55)',
};

const serif = "'Times New Roman', 'Georgia', serif";
const mono = "var(--font-space-mono), 'Space Mono', monospace";
const script = "var(--font-dancing-script), 'Dancing Script', cursive";

type FieldKey = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

export default function SignupPage() {
  const [form, setForm] = useState<Record<FieldKey, string>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [focus, setFocus] = useState<Record<FieldKey, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey | 'general', string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [rainDone, setRainDone] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setRainDone(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const set = (k: FieldKey, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear error for this field as the user types
    setErrors((prev) => { const next = { ...prev }; delete next[k]; return next; });
  };
  const setF = (k: FieldKey, v: boolean) => setFocus((f) => ({ ...f, [k]: v }));

  const validateAll = (): Partial<Record<FieldKey | 'general', string>> => {
    const { firstName, lastName, email, password, confirmPassword } = form;
    const errs: Partial<Record<FieldKey | 'general', string>> = {};
    if (!firstName.trim()) errs.firstName = 'please enter your first name';
    if (!lastName.trim()) errs.lastName = 'please enter your last name';
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'please enter your email';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errs.email = "hmm, that doesn't look like an email";
    }
    if (!password) {
      errs.password = 'please enter a password';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errs.password = `password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "passwords don't match";
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const { firstName, lastName, email, password, confirmPassword } = form;
    const trimmedEmail = email.trim();

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: trimmedEmail,
          password,
          confirmPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; field?: string };
        const field = data?.field as FieldKey | undefined;
        if (field) {
          setErrors({ [field]: data?.error ?? 'invalid value' });
        } else {
          setErrors({ general: data?.error ?? 'something went wrong, try again' });
        }
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 800);
    } catch {
      setErrors({ general: 'connection error, try again' });
      setLoading(false);
    }
  };

  const pageStyle: CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: rainDone ? C.outerCard : C.bodyBg,
    transition: 'background-color 1.5s ease',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: rainDone ? 'rgba(150,151,83,0.2)' : C.overlayBg,
    transition: 'background-color 1.5s ease',
    zIndex: 1,
    pointerEvents: 'none',
  };

  const outerCardStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '880px',
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
    height: '100%',
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
    padding: '18px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  };

  const titleStyle: CSSProperties = {
    fontFamily: serif,
    fontSize: '52px',
    fontWeight: 400,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: C.darkPink,
    textShadow: '1px 2px 0 rgba(131,22,51,0.12)',
    lineHeight: 1,
  };

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
    width: '38%',
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
    padding: '28px 32px 22px 28px',
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

  const quoteStyle: CSSProperties = {
    fontFamily: serif,
    fontSize: '28px',
    fontStyle: 'italic',
    color: C.textPrimary,
    lineHeight: 1.5,
  };

  const labelTiny: CSSProperties = {
    fontFamily: mono,
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: C.textSecondary,
  };

  const labelSignUp: CSSProperties = {
    ...labelTiny,
    color: C.lineColor,
    fontSize: '12px',
    marginBottom: '18px',
  };

  const inputWrapStyle: CSSProperties = {
    position: 'relative',
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
    height: '32px',
    border: 'none',
    borderBottom: `1.5px solid ${focused ? C.inputBorderFocus : C.inputBorderDefault}`,
    background: 'transparent',
    outline: 'none',
    fontFamily: mono,
    fontSize: '13px',
    letterSpacing: '0.02em',
    color: C.textPrimary,
    transition: 'border-bottom-color 0.25s ease',
    padding: '0 0 4px 0',
  });

  const showHideStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: '6px',
    fontFamily: mono,
    fontSize: '9px',
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
    height: '42px',
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

  const loginLinkWrap: CSSProperties = {
    fontFamily: mono,
    fontSize: '10px',
    letterSpacing: '0.06em',
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: '12px',
  };

  const loginLinkStyle: CSSProperties = {
    color: C.darkPink,
    borderBottom: '1px solid rgba(131,22,51,0.3)',
    textDecoration: 'none',
    paddingBottom: '1px',
  };

  const errorStyle: CSSProperties = {
    fontFamily: mono,
    fontSize: '11px',
    color: C.darkPink,
    marginTop: '6px',
    marginBottom: '4px',
    animation: 'petal-shake 0.3s ease',
  };

  // Shown under each individual field
  const fieldErrorStyle: CSSProperties = {
    fontFamily: mono,
    fontSize: '10px',
    color: C.darkPink,
    marginTop: '5px',
    letterSpacing: '0.02em',
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

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: '24px',
    rowGap: '14px',
  };

  const fullSpan: CSSProperties = { gridColumn: '1 / -1' };

  return (
    <main style={pageStyle}>
      <BackgroundVideo />
      <div style={overlayStyle} />
      <RainCanvas />

      <div style={outerCardStyle}>
        <div style={innerCardStyle}>
          <div style={headerStyle}>
            <div style={titleStyle}>Petal</div>
            <div style={stampBoxStyle}>
              <svg width="28" height="26" viewBox="0 0 24 22" fill={C.darkPink} style={{ opacity: 0.8 }}>
                <path d="M12 21s-7.5-4.7-10-9.2C0 8 1.8 4 5.5 4c2 0 3.6 1 4.5 2.5C10.9 5 12.5 4 14.5 4 18.2 4 20 8 18 11.8 17.5 16.3 12 21 12 21z" />
              </svg>
            </div>
          </div>

          <div style={bodyStyle}>
            <div style={verticalSideStyle}>Digital Journal</div>

            {!submitted ? (
              <>
                <div style={leftPanelStyle}>
                  <div style={{ marginTop: '8px' }}>
                    <div style={quoteStyle}>
                      <div style={{ marginBottom: '10px' }}>a new page,</div>
                      <div style={{ marginBottom: '10px' }}>a quiet place</div>
                      <div>to be honest</div>
                    </div>
                    <div style={{ marginTop: '16px', color: C.darkPink, fontSize: '24px' }}>&#9829;</div>
                  </div>
                  <div style={{ ...labelTiny, color: C.textSecondary }}>
                    {'From:  '}<span style={{ color: C.darkPink }}>Petal</span>
                  </div>
                </div>

                <div style={dividerStyle} />

                <div style={rightPanelStyle}>
                  <div style={labelSignUp}>Sign Up</div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div style={gridStyle}>
                      <div style={inputWrapStyle}>
                        <label htmlFor="firstName" style={inputLabelStyle(focus.firstName)}>First Name</label>
                        <input
                          id="firstName"
                          type="text"
                          value={form.firstName}
                          onChange={(e) => set('firstName', e.target.value)}
                          onFocus={() => setF('firstName', true)}
                          onBlur={() => setF('firstName', false)}
                          style={inputStyle(focus.firstName)}
                          autoComplete="given-name"
                        />
                        {errors.firstName && <div style={fieldErrorStyle}>{errors.firstName}</div>}
                      </div>

                      <div style={inputWrapStyle}>
                        <label htmlFor="lastName" style={inputLabelStyle(focus.lastName)}>Last Name</label>
                        <input
                          id="lastName"
                          type="text"
                          value={form.lastName}
                          onChange={(e) => set('lastName', e.target.value)}
                          onFocus={() => setF('lastName', true)}
                          onBlur={() => setF('lastName', false)}
                          style={inputStyle(focus.lastName)}
                          autoComplete="family-name"
                        />
                        {errors.lastName && <div style={fieldErrorStyle}>{errors.lastName}</div>}
                      </div>

                      <div style={{ ...inputWrapStyle, ...fullSpan }}>
                        <label htmlFor="email" style={inputLabelStyle(focus.email)}>Email</label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => set('email', e.target.value)}
                          onFocus={() => setF('email', true)}
                          onBlur={() => setF('email', false)}
                          style={inputStyle(focus.email)}
                          autoComplete="email"
                        />
                        {errors.email && <div style={fieldErrorStyle}>{errors.email}</div>}
                      </div>

                      <div style={inputWrapStyle}>
                        <label htmlFor="password" style={inputLabelStyle(focus.password)}>Password</label>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={(e) => set('password', e.target.value)}
                          onFocus={() => setF('password', true)}
                          onBlur={() => setF('password', false)}
                          style={inputStyle(focus.password)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          style={showHideStyle}
                          tabIndex={-1}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                        {errors.password && <div style={fieldErrorStyle}>{errors.password}</div>}
                      </div>

                      <div style={inputWrapStyle}>
                        <label htmlFor="confirmPassword" style={inputLabelStyle(focus.confirmPassword)}>Confirm Password</label>
                        <input
                          id="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={(e) => set('confirmPassword', e.target.value)}
                          onFocus={() => setF('confirmPassword', true)}
                          onBlur={() => setF('confirmPassword', false)}
                          style={inputStyle(focus.confirmPassword)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          style={showHideStyle}
                          tabIndex={-1}
                        >
                          {showConfirm ? 'Hide' : 'Show'}
                        </button>
                        {errors.confirmPassword && <div style={fieldErrorStyle}>{errors.confirmPassword}</div>}
                      </div>
                    </div>

                    {errors.general && (
                      <div style={{ ...errorStyle, marginTop: '10px' }}>{errors.general}</div>
                    )}

                    <div style={{ marginTop: '14px' }}>
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
                            <span>Creating...</span>
                          </>
                        ) : (
                          'Start Your Journal'
                        )}
                      </button>

                      <div style={loginLinkWrap}>
                        already have an account?{' '}
                        <a href="/login" style={loginLinkStyle}>log in</a>
                      </div>
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
                <div style={{ fontFamily: script, fontSize: '36px', color: C.darkPink }}>
                  welcome to petal
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
                  your first page awaits
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
