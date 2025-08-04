import { render, screen } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPage from '@/pages/dashboard'

jest.mock('@/contexts/AuthContext')
jest.mock('@/components/Layout', () => ({ children }: any) => <div>{children}</div>)
jest.mock('@/components/ProtectedRoute', () => ({ children }: any) => <div>{children}</div>)
jest.mock('@/components/Dashboard', () => () => <div>Regular Dashboard</div>)
jest.mock('@/components/UserManagement', () => () => <div>User Management</div>)

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('DashboardPage', () => {
  it('shows user management for SuperUser', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'admin', role: 'SuperUser' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<DashboardPage />)
    
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.queryByText('Regular Dashboard')).not.toBeInTheDocument()
  })

  it('shows regular dashboard for other users', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'user', role: 'User' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<DashboardPage />)
    
    expect(screen.getByText('Regular Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('User Management')).not.toBeInTheDocument()
  })
})