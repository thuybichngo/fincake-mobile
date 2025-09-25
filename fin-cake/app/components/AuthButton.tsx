'use client'

import { useState, useEffect } from 'react'
import { signInWithOtp, signOut, getCurrentUser, type AuthUser } from '@/lib/auth'

export default function AuthButton() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(setUser)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setMessage('')

    const result = await signInWithOtp(email)
    
    if (result.success) {
      setMessage('Vui lòng kiểm tra email của bạn để đăng nhập!')
      setShowModal(false)
    } else {
      setMessage(`Lỗi: ${result.error}`)
    }
    
    setIsLoading(false)
  }

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      setUser(null)
      setMessage('Đã đăng xuất thành công!')
    } else {
      setMessage(`Lỗi: ${result.error}`)
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Xin chào, {user.email}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Đăng nhập
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Đăng nhập</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết đăng nhập'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                message.includes('Lỗi') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

