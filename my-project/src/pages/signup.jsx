import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('http://127.0.0.1:8000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || 'Signup failed')
            }

            setSuccess(true)
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.topBar}></div>
                <div style={styles.cardContent}>
                    {/* Icon */}
                    <div style={styles.iconWrapper}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                    </div>

                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.subtitle}>Join us today — it only takes a minute</p>

                    {error && <div style={styles.errorMsg}>{error}</div>}
                    {success && <div style={styles.successMsg}>Account created! Redirecting to login...</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>

                        {/* Email */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#000'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d1d1'
                                    e.target.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#000'
                                        e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#d1d1d1'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#000'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d1d1'
                                    e.target.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.background = '#333'
                                    e.target.style.transform = 'translateY(-1px)'
                                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#000'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)'
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={styles.divider}>
                        <div style={styles.dividerLine}></div>
                        <span style={styles.dividerText}>or sign up with</span>
                        <div style={styles.dividerLine}></div>
                    </div>

                    {/* Social Buttons */}
                    <div style={styles.socialRow}>
                        <button
                            style={styles.socialBtn}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#000'
                                e.currentTarget.style.background = '#f5f5f5'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#d1d1d1'
                                e.currentTarget.style.background = '#fff'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#888" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#444" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#aaa" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#666" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                            Google
                        </button>
                        <button
                            style={styles.socialBtn}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#000'
                                e.currentTarget.style.background = '#f5f5f5'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#d1d1d1'
                                e.currentTarget.style.background = '#fff'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            GitHub
                        </button>
                    </div>

                    <p style={styles.loginText}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.loginLink}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f7f7',
        padding: '2rem',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        border: '1px solid #e5e5e5',
    },
    topBar: {
        height: '4px',
        background: '#000',
    },
    cardContent: {
        padding: '2.5rem',
    },
    iconWrapper: {
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        margin: '0 0 0.4rem',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#888',
        textAlign: 'center',
        margin: '0 0 2rem',
    },
    errorMsg: {
        background: '#f5f5f5',
        border: '1px solid #000',
        color: '#000',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        textAlign: 'center',
        fontWeight: '500',
    },
    successMsg: {
        background: '#f5f5f5',
        border: '1px solid #888',
        color: '#333',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        textAlign: 'center',
        fontWeight: '500',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#222',
    },
    input: {
        width: '100%',
        padding: '0.8rem 1rem',
        border: '2px solid #d1d1d1',
        borderRadius: '12px',
        fontSize: '0.95rem',
        color: '#000',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#fafafa',
        boxSizing: 'border-box',
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#555',
        padding: '4px 8px',
        letterSpacing: '0.02em',
    },
    submitBtn: {
        padding: '0.85rem',
        background: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        marginTop: '0.5rem',
        letterSpacing: '0.01em',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        margin: '1.75rem 0',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: '#e0e0e0',
    },
    dividerText: {
        fontSize: '0.8rem',
        color: '#999',
        whiteSpace: 'nowrap',
    },
    socialRow: {
        display: 'flex',
        gap: '1rem',
    },
    socialBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: '#fff',
        border: '2px solid #d1d1d1',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#222',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    loginText: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#777',
        marginTop: '1.75rem',
        marginBottom: 0,
    },
    loginLink: {
        color: '#000',
        fontWeight: '700',
        textDecoration: 'underline',
    },
}

export default Signup
