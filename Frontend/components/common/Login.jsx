import React, { useState } from 'react'
import { authAPI } from '../../utils/api'

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (!name || !email || !password) {
          setError('Please fill in all required fields')
          setLoading(false)
          return
        }
        const response = await authAPI.register({ name, email, password, phone })
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        onLogin(response.user, response.user.role === 'admin')
      } else {
        if (!email || !password) {
          setError('Please enter both email and password')
          setLoading(false)
          return
        }
        const response = await authAPI.login(email, password)
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        onLogin(response.user, response.user.role === 'admin')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4 scroll-smooth">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-4 sm:p-6 lg:p-8 border border-gray-200">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-3 sm:p-4 bg-gray-800 rounded-lg mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">SKY-HI</h1>
          </div>
          <p className="text-gray-600 font-medium text-sm sm:text-base tracking-wide uppercase">Fine Dining POS System</p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
              !isRegister
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isRegister
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                placeholder="Enter your name"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                placeholder="Enter your email"
                required
              />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                placeholder="Enter your password"
                required
                minLength={6}
              />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                placeholder="Enter your phone number"
              />
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Processing...
              </span>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

