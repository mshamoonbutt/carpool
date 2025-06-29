# UniPool Redirection Guide

## Overview
This document outlines all the redirection flows in the UniPool application to ensure proper navigation and authentication handling.

## Authentication Components

### 1. ProtectedRoute Component
- **Location**: `src/components/auth/ProtectedRoute.jsx`
- **Purpose**: Protects routes that require authentication
- **Behavior**: 
  - Checks if user is authenticated
  - If not authenticated, redirects to `/login` with the intended destination stored in location state
  - Shows loading spinner during authentication check
  - Listens for auth changes and rechecks authentication

### 2. PublicRoute Component
- **Location**: `src/components/auth/PublicRoute.jsx`
- **Purpose**: Prevents authenticated users from accessing public pages
- **Behavior**:
  - Checks if user is already authenticated
  - If authenticated, redirects to `/dashboard`
  - Shows loading spinner during check
  - Listens for auth changes

## Route Configuration

### Protected Routes
- `/dashboard` - Main application dashboard
- `/test` - Test page for development

### Public Routes
- `/` - Landing page (accessible to all)
- `/login` - Login page (redirects authenticated users to dashboard)
- `/signup` - Registration page (redirects authenticated users to dashboard)

## Redirection Flows

### 1. Unauthenticated User Accessing Protected Route
```
User visits /dashboard → ProtectedRoute checks auth → No user found → Redirect to /login
```

### 2. Authenticated User Accessing Public Route
```
User visits /login → PublicRoute checks auth → User found → Redirect to /dashboard
```

### 3. Login Flow
```
User submits login form → AuthService.login() → Success → Navigate to intended destination or /dashboard
```

### 4. Logout Flow
```
User clicks logout → AuthService.logout() → Clear localStorage → Trigger authChange → Redirect to /login
```

### 5. Signup Flow
```
User submits signup form → Create user → Store in localStorage → Trigger authChange → Navigate to /dashboard
```

## Navigation Methods

### React Router Navigation (Preferred)
- Uses `navigate()` from `useNavigate` hook
- Maintains SPA behavior
- No page reloads
- Preserves application state

### Window Location (Fallback)
- Used only in error pages and debug functions
- Causes full page reload
- Should be avoided for normal navigation

## Authentication State Management

### LocalStorage Keys
- `currentUser` - Stores the current authenticated user
- `users` - Stores all test users for development

### Events
- `authChange` - Custom event triggered when authentication state changes
- Used by components to react to login/logout

## Testing Redirections

### Manual Testing
1. Open browser console
2. Run `testRedirections()` to execute all redirection tests
3. Check console output for test results

### Available Debug Functions
- `checkAuthState()` - Check current authentication state
- `clearAuth()` - Clear authentication and redirect to login
- `switchUser(email)` - Switch to a different test user
- `testRedirections()` - Run comprehensive redirection tests

## Test Users

### Available Test Accounts
1. **Ali Hassan** (Driver)
   - Email: `ali.hassan@formanite.fccollege.edu.pk`
   - Password: `temp123`
   - Role: `driver`

2. **Sara Khan** (Rider)
   - Email: `sara.khan@formanite.fccollege.edu.pk`
   - Password: `temp123`
   - Role: `rider`

3. **Ahmed Raza** (Both)
   - Email: `ahmed.raza@formanite.fccollege.edu.pk`
   - Password: `temp123`
   - Role: `both`

4. **Fatima Ali** (Driver)
   - Email: `fatima.ali@formanite.fccollege.edu.pk`
   - Password: `temp123`
   - Role: `driver`

## Error Handling

### Authentication Errors
- Invalid email domain → Show error message
- User not found → Show error message
- Invalid password → Show error message

### Navigation Errors
- 404 errors → Show ErrorPage component
- Authentication failures → Redirect to login
- Network errors → Show error message

## Best Practices

1. **Always use React Router navigation** for internal navigation
2. **Use ProtectedRoute** for any page that requires authentication
3. **Use PublicRoute** for login/signup pages
4. **Handle loading states** during authentication checks
5. **Provide clear error messages** for authentication failures
6. **Test all redirection flows** before deployment

## Troubleshooting

### Common Issues
1. **Infinite redirect loops** - Check authentication logic in components
2. **Missing user data** - Verify localStorage is properly set
3. **Navigation not working** - Ensure React Router is properly configured
4. **Authentication state not updating** - Check if authChange events are being dispatched

### Debug Steps
1. Open browser console
2. Run `checkAuthState()` to verify current state
3. Check localStorage for user data
4. Verify route configuration in router.jsx
5. Test individual redirection flows

## Security Considerations

1. **Email validation** - Only university emails are allowed
2. **Authentication guards** - Protected routes are properly secured
3. **Session management** - User sessions are properly managed
4. **Error handling** - Sensitive information is not exposed in errors 