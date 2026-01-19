import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../services/authService'

// Simple JWT decoder to extract payload
const decodeToken = (token) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = getToken()
  
  // Not authenticated
  if (!token) {
    return <Navigate to="/auth" replace />
  }
  
  // Check admin role if required
  if (requireAdmin) {
    const payload = decodeToken(token)
    if (!payload || payload.role !== 'admin') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1 style={{ color: '#333', fontSize: '24px' }}>Access Denied</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>You don't have permission to access this page</p>
          <a href="/" style={{
            color: '#8B4513',
            textDecoration: 'none',
            padding: '10px 20px',
            border: '1px solid #8B4513',
            borderRadius: '5px'
          }}>
            Go Home
          </a>
        </div>
      )
    }
  }
  
  return children
}
