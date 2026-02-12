import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, isLoggedIn } from '../utils/auth'

function Dashboard() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('chatHistory')
        return saved ? JSON.parse(saved) : []
    })
    const [activeChatId, setActiveChatId] = useState(null)
    const [messageInput, setMessageInput] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [userEmail, setUserEmail] = useState('User')
    const [model, setModel] = useState('GPT-4')
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [typing, setTyping] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoggedIn()) { navigate('/login'); return }
        const token = localStorage.getItem('access_token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUserEmail(payload.sub || payload.email || 'User')
            } catch { setUserEmail('User') }
        }
    }, [navigate])

    useEffect(() => { localStorage.setItem('theme', darkMode ? 'dark' : 'light') }, [darkMode])
    useEffect(() => { localStorage.setItem('chatHistory', JSON.stringify(chats)) }, [chats])
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chats, activeChatId])

    const activeChat = chats.find(c => c.id === activeChatId)

    const handleNewChat = () => {
        const newChat = { id: Date.now(), title: 'New chat', messages: [], createdAt: new Date().toISOString() }
        setChats(prev => [newChat, ...prev])
        setActiveChatId(newChat.id)
        setMessageInput('')
        inputRef.current?.focus()
    }

    const handleDeleteChat = (id, e) => {
        e.stopPropagation()
        setChats(prev => prev.filter(c => c.id !== id))
        if (activeChatId === id) setActiveChatId(null)
    }

    const handleSend = async () => {
        if (!messageInput.trim() || typing) return
        const msg = messageInput.trim()
        setMessageInput('')

        let chatId = activeChatId

        if (!chatId) {
            const newChat = {
                id: Date.now(),
                title: msg.slice(0, 40),
                messages: [{ role: 'user', content: msg }],
                createdAt: new Date().toISOString(),
            }
            setChats(prev => [newChat, ...prev])
            setActiveChatId(newChat.id)
            chatId = newChat.id
        } else {
            setChats(prev => prev.map(c => {
                if (c.id !== chatId) return c
                const updated = { ...c, messages: [...c.messages, { role: 'user', content: msg }] }
                if (c.messages.length === 0) updated.title = msg.slice(0, 40)
                return updated
            }))
        }

        // Call the real API
        setTyping(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ message: msg }),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.detail || 'Failed to get response')
            }

            const data = await res.json()
            const reply = data.answer || data.response || data.message || JSON.stringify(data)

            setChats(prev => prev.map(c =>
                c.id === chatId
                    ? { ...c, messages: [...c.messages, { role: 'assistant', content: reply }] }
                    : c
            ))
        } catch (err) {
            setChats(prev => prev.map(c =>
                c.id === chatId
                    ? { ...c, messages: [...c.messages, { role: 'assistant', content: `Error: ${err.message}` }] }
                    : c
            ))
        } finally {
            setTyping(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const handleLogout = () => { logout(); navigate('/login') }

    const t = darkMode ? dark : light

    // Group chats by date
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)

    const groups = [
        { label: 'Today', chats: chats.filter(c => new Date(c.createdAt) >= today) },
        { label: 'Yesterday', chats: chats.filter(c => { const d = new Date(c.createdAt); return d >= yesterday && d < today }) },
        { label: 'Previous 7 Days', chats: chats.filter(c => { const d = new Date(c.createdAt); return d >= weekAgo && d < yesterday }) },
        { label: 'Older', chats: chats.filter(c => new Date(c.createdAt) < weekAgo) },
    ].filter(g => g.chats.length > 0)

    return (
        <div style={{ ...s.page, background: t.pageBg, color: t.text }}>
            {/* Sidebar */}
            {sidebarOpen && (
                <div style={{ ...s.sidebar, background: t.sidebarBg, borderRight: `1px solid ${t.border}` }}>
                    {/* Sidebar Top */}
                    <div style={s.sidebarTop}>
                        <button onClick={handleNewChat} style={{ ...s.newChatBtn, background: t.cardBg, border: `1px solid ${t.border}`, color: t.text }}
                            onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                            onMouseLeave={e => e.currentTarget.style.background = t.cardBg}>
                            <span style={{ fontSize: '1.1rem' }}>+</span> New chat
                        </button>
                    </div>

                    {/* Chat History */}
                    <div style={s.chatList}>
                        {groups.map(g => (
                            <div key={g.label}>
                                <div style={{ ...s.groupLabel, color: t.muted }}>{g.label}</div>
                                {g.chats.map(chat => (
                                    <button key={chat.id} onClick={() => setActiveChatId(chat.id)}
                                        style={{
                                            ...s.chatItem,
                                            background: chat.id === activeChatId ? t.hoverBg : 'transparent',
                                            color: t.text,
                                        }}
                                        onMouseEnter={e => { if (chat.id !== activeChatId) e.currentTarget.style.background = t.hoverBg }}
                                        onMouseLeave={e => { if (chat.id !== activeChatId) e.currentTarget.style.background = 'transparent' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span style={s.chatTitle}>{chat.title}</span>
                                        <span style={s.deleteBtn} onClick={(e) => handleDeleteChat(chat.id, e)}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                            ✕
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Bottom */}
                    <div style={{ ...s.sidebarBottom, borderTop: `1px solid ${t.border}` }}>
                        <button onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{ ...s.userBtn, color: t.text }}
                            onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ ...s.avatar, background: t.accent, color: t.accentText }}>
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>•••</span>
                        </button>
                        {showUserMenu && (
                            <div style={{ ...s.userMenu, background: t.cardBg, border: `1px solid ${t.border}` }}>
                                <button style={{ ...s.menuItem, color: t.text }}
                                    onClick={() => setDarkMode(!darkMode)}
                                    onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    {darkMode ? '☀ Light mode' : '☾ Dark mode'}
                                </button>
                                <button style={{ ...s.menuItem, color: t.text }}
                                    onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    Settings
                                </button>
                                <div style={{ height: '1px', background: t.border, margin: '4px 0' }}></div>
                                <button style={{ ...s.menuItem, color: t.text }}
                                    onClick={handleLogout}
                                    onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div style={{ ...s.main, marginLeft: sidebarOpen ? '260px' : 0 }}>
                {/* Top Bar */}
                <div style={s.topBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ ...s.iconBtn, color: t.muted }}
                            onMouseEnter={e => e.currentTarget.style.color = t.text}
                            onMouseLeave={e => e.currentTarget.style.color = t.muted}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        {/* Model Selector */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowModelDropdown(!showModelDropdown)}
                                style={{ ...s.modelBtn, color: t.text }}
                                onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {model} <span style={{ fontSize: '0.6rem', marginLeft: '4px' }}>▼</span>
                            </button>
                            {showModelDropdown && (
                                <div style={{ ...s.dropdown, background: t.cardBg, border: `1px solid ${t.border}` }}>
                                    {['GPT-4', 'GPT-4o', 'GPT-3.5'].map(m => (
                                        <button key={m}
                                            onClick={() => { setModel(m); setShowModelDropdown(false) }}
                                            style={{ ...s.menuItem, color: t.text, fontWeight: m === model ? '700' : '400' }}
                                            onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            {m} {m === model && '✓'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages or Welcome */}
                <div style={s.chatArea}>
                    {!activeChat || activeChat.messages.length === 0 ? (
                        <div style={s.welcome}>
                            <div style={{ ...s.welcomeLogo, color: t.text }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0.75rem 0 0.5rem', color: t.text }}>How can I help you today?</h2>
                            <div style={s.suggestions}>
                                {[
                                    { title: 'Write a story', desc: 'about a robot learning to paint' },
                                    { title: 'Explain quantum computing', desc: 'in simple terms' },
                                    { title: 'Help me debug', desc: 'my Python code' },
                                    { title: 'Plan a trip', desc: 'to Tokyo for 5 days' },
                                ].map((item, i) => (
                                    <button key={i}
                                        onClick={() => { setMessageInput(item.title + ' ' + item.desc); inputRef.current?.focus() }}
                                        style={{ ...s.suggestionCard, background: t.cardBg, border: `1px solid ${t.border}`, color: t.text }}
                                        onMouseEnter={e => e.currentTarget.style.background = t.hoverBg}
                                        onMouseLeave={e => e.currentTarget.style.background = t.cardBg}>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.title}</span>
                                        <span style={{ color: t.muted, fontSize: '0.8rem' }}>{item.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={s.messages}>
                            {activeChat.messages.map((msg, i) => (
                                <div key={i} style={{ ...s.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    {msg.role === 'assistant' && (
                                        <div style={{ ...s.msgAvatar, background: t.accent, color: t.accentText }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    )}
                                    <div style={{
                                        ...s.messageBubble,
                                        background: msg.role === 'user' ? t.accent : t.cardBg,
                                        color: msg.role === 'user' ? t.accentText : t.text,
                                        border: msg.role === 'assistant' ? `1px solid ${t.border}` : 'none',
                                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {typing && (
                                <div style={{ ...s.messageRow, justifyContent: 'flex-start' }}>
                                    <div style={{ ...s.msgAvatar, background: t.accent, color: t.accentText }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                                            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div style={{
                                        ...s.messageBubble,
                                        background: t.cardBg,
                                        color: t.muted,
                                        border: `1px solid ${t.border}`,
                                        borderRadius: '18px 18px 18px 4px',
                                        display: 'flex',
                                        gap: '4px',
                                        alignItems: 'center',
                                        padding: '1rem 1.3rem',
                                    }}>
                                        <span style={{ animation: 'pulse 1.4s infinite', animationDelay: '0s' }}>●</span>
                                        <span style={{ animation: 'pulse 1.4s infinite', animationDelay: '0.2s' }}>●</span>
                                        <span style={{ animation: 'pulse 1.4s infinite', animationDelay: '0.4s' }}>●</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div style={{ ...s.inputArea, background: t.pageBg }}>
                    <div style={{ ...s.inputWrapper, background: t.cardBg, border: `1px solid ${t.border}` }}>
                        <textarea
                            ref={inputRef}
                            value={messageInput}
                            onChange={e => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message ChatGPT..."
                            rows={1}
                            style={{ ...s.input, color: t.text }}
                        />
                        <button onClick={handleSend}
                            disabled={!messageInput.trim()}
                            style={{
                                ...s.sendBtn,
                                background: messageInput.trim() ? t.accent : t.border,
                                color: messageInput.trim() ? t.accentText : t.muted,
                                cursor: messageInput.trim() ? 'pointer' : 'default',
                            }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                    <p style={{ ...s.disclaimer, color: t.muted }}>
                        ChatGPT can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    )
}



/* ----- Theme Tokens ----- */
const light = {
    pageBg: '#fff', sidebarBg: '#f9f9f9', cardBg: '#f4f4f4', text: '#000', muted: '#888',
    border: '#e5e5e5', accent: '#000', accentText: '#fff', hoverBg: '#ececec',
}
const dark = {
    pageBg: '#0d0d0d', sidebarBg: '#111', cardBg: '#1e1e1e', text: '#fff', muted: '#888',
    border: '#2a2a2a', accent: '#fff', accentText: '#000', hoverBg: '#222',
}

/* ----- Styles ----- */
const s = {
    page: { minHeight: '100vh', display: 'flex', fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" },
    sidebar: { width: '260px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20 },
    sidebarTop: { padding: '0.75rem' },
    newChatBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0.85rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.15s ease' },
    chatList: { flex: 1, overflowY: 'auto', padding: '0 0.5rem' },
    groupLabel: { fontSize: '0.75rem', fontWeight: '600', padding: '1rem 0.5rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    chatItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.1s ease', position: 'relative' },
    chatTitle: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
    deleteBtn: { opacity: 0, fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer', borderRadius: '4px', transition: 'opacity 0.15s', flexShrink: 0 },
    sidebarBottom: { padding: '0.75rem', position: 'relative' },
    userBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.15s ease', textAlign: 'left' },
    avatar: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 },
    userMenu: { position: 'absolute', bottom: '100%', left: '0.75rem', right: '0.75rem', borderRadius: '10px', padding: '4px', marginBottom: '4px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 30 },
    menuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.1s' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s ease' },
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', position: 'sticky', top: 0, zIndex: 10 },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' },
    modelBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', padding: '0.4rem 0.75rem', borderRadius: '8px', transition: 'background 0.15s', display: 'flex', alignItems: 'center' },
    dropdown: { position: 'absolute', top: '100%', left: 0, minWidth: '150px', borderRadius: '10px', padding: '4px', marginTop: '4px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 30 },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '768px', width: '100%', margin: '0 auto', padding: '0 1.5rem' },
    welcome: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: '6rem' },
    welcomeLogo: { marginBottom: '0.25rem' },
    suggestions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem', maxWidth: '520px', width: '100%' },
    suggestionCard: { display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' },
    messages: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem 0 6rem' },
    messageRow: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
    msgAvatar: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' },
    messageBubble: { padding: '0.85rem 1.1rem', maxWidth: '75%', fontSize: '0.95rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    inputArea: { position: 'sticky', bottom: 0, padding: '0.75rem 1.5rem 1rem', maxWidth: '768px', width: '100%', margin: '0 auto', boxSizing: 'border-box' },
    inputWrapper: { display: 'flex', alignItems: 'flex-end', borderRadius: '16px', padding: '0.5rem 0.5rem 0.5rem 1rem', gap: '0.5rem' },
    input: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem', resize: 'none', lineHeight: '1.5', padding: '0.35rem 0', maxHeight: '150px', fontFamily: 'inherit' },
    sendBtn: { width: '36px', height: '36px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease', flexShrink: 0 },
    disclaimer: { fontSize: '0.75rem', textAlign: 'center', margin: '0.5rem 0 0', letterSpacing: '0.01em' },
}

export default Dashboard
