# ACI Dashboard Frontend

A modern Next.js frontend application with role-based access control and user management features.

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with HTTP-only cookies
- **Role-based access control** (SuperUser, Admin, Manager, User, Guest)
- **Permission-based navigation** and feature access
- **Protected routes** with automatic redirects
- **Session management** with automatic token refresh

### 🎨 User Interface
- **Modern, responsive design** using Tailwind CSS
- **Role-specific dashboards** with different content and features
- **Dynamic navigation** that changes based on user role
- **Mobile-friendly** interface with responsive components
- **Loading states** and error handling

### 👥 User Management (SuperUser Only)
- **User listing** with search and filtering
- **Role assignment** and user promotion
- **User statistics** and activity monitoring
- **User deletion** and account management
- **Real-time updates** using React Query

### 📊 Dashboard Features
- **Role-specific content** and statistics
- **Quick actions** based on user permissions
- **Recent activity** tracking
- **Feature overview** for each role level

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Forms**: React Hook Form with validation
- **Icons**: Heroicons
- **UI Components**: Headless UI
- **HTTP Client**: Axios with interceptors

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.sample .env.local
   ```
   
   Edit `.env.local` and set:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Demo Credentials

Use these credentials to test different roles:

- **SuperUser**: `admin` / `admin123`
- **Admin**: `admin` / `admin123` (can be promoted to SuperUser)
- **Manager**: `manager` / `manager123`
- **User**: `user` / `user123`

## Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── Dashboard.tsx    # Role-specific dashboard content
│   ├── LoginForm.tsx    # Authentication form
│   ├── Navigation.tsx   # Role-based navigation
│   ├── UserManagement.tsx # User management (SuperUser)
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Next.js pages
│   ├── _app.tsx        # App wrapper with providers
│   ├── index.tsx       # Home page (redirects)
│   ├── login.tsx       # Login page
│   └── dashboard.tsx   # Protected dashboard
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS imports
└── public/             # Static assets
```

## Role-Based Features

### SuperUser
- Full system administration
- User management and role assignment
- System configuration access
- Audit logs and security monitoring
- Database administration tools

### Admin
- User management (limited)
- Project oversight
- Team performance reports
- Resource allocation
- Compliance monitoring

### Manager
- Team management
- Project tracking
- Performance reviews
- Resource planning
- Client communication

### User
- Task management
- Project collaboration
- Personal calendar
- Document access
- Team communication

### Guest
- Basic feature exploration
- Documentation access
- Support resources
- Training materials

## API Integration

The frontend integrates with the FastAPI backend through:

- **Authentication endpoints**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **User management**: `/api/users`, `/api/admin/promote-user`
- **Role management**: `/api/roles`
- **Permission system**: Integrated with user roles

### HTTP Client Configuration

```typescript
// Axios is configured to:
axios.defaults.withCredentials = true; // For cookie-based auth
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Tailwind CSS** for styling

### State Management

- **React Query** for server state (users, roles, etc.)
- **React Context** for authentication state
- **React Hook Form** for form state

## Deployment

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   ```

### Docker Deployment

Use the provided Dockerfile:

```bash
# Build the image
docker build -t aci-frontend .

# Run the container
docker run -p 3000:3000 aci-frontend
```

### Environment Variables

Required environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL

## Security Features

- **HTTP-only cookies** for JWT storage
- **CSRF protection** through proper cookie handling
- **Role-based access control** on both client and server
- **Protected routes** with automatic redirects
- **Input validation** using React Hook Form
- **XSS protection** through proper data sanitization

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend CORS is configured for frontend domain
2. **Authentication issues**: Check cookie settings and API URL
3. **Build errors**: Verify Node.js version and dependencies
4. **API connection**: Ensure backend is running and accessible

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG=true
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include proper error handling
4. Test with different user roles
5. Update documentation for new features

## License

This project is part of the ACI Dashboard application. 