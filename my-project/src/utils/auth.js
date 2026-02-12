export async function refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) {
        throw new Error('No refresh token available')
    }

    const res = await fetch('http://127.0.0.1:8000/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
    })

    if (!res.ok) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token_type')
        localStorage.removeItem('refresh_token')
        throw new Error('Session expired. Please login again.')
    }

    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('token_type', data.token_type)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
}

export function getAccessToken() {
    return localStorage.getItem('access_token')
}

export function getAuthHeader() {
    const token = localStorage.getItem('access_token')
    const type = localStorage.getItem('token_type') || 'Bearer'
    return token ? { Authorization: `${type} ${token}` } : {}
}

export function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('refresh_token')
}

export function isLoggedIn() {
    return !!localStorage.getItem('access_token')
}
