import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'

// Mock the auth context
jest.mock('@/contexts/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('LoginForm', () => {
  const mockLogin = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Welcome Back 👋')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows error on failed login', async () => {
    mockLogin.mockResolvedValue(false)
    
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })
})