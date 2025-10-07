# Forgot Password Feature

## Overview

A complete forgot password implementation has been added to your authentication system with a dark-themed, centered form UI.

## What Was Created

### 1. Frontend - Forgot Password Page

**Location:** `/apps/web/src/app/(auth)/forgot-password/page.tsx`

**Features:**

- Two-step verification process:
  1. **Step 1:** User enters email and username to verify identity
  2. **Step 2:** User sets a new password with confirmation
- Dark purple gradient background (`linear-gradient(45deg, #2c1654, #3a1e5c, #4a2472)`)
- Centered form layout matching existing auth pages
- Password visibility toggle for new password and confirm password fields
- Real-time error and success message display
- Smooth fade-in animations
- Responsive design for all screen sizes
- Automatic redirect to login page after successful password reset

### 2. Backend - API Endpoints

#### Verify Identity Endpoint

**Location:** `/apps/server/src/app/api/auth/verify-identity/route.ts`

- **Method:** POST
- **Endpoint:** `/api/auth/verify-identity`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "username"
  }
  ```
- **Response:** Verifies if the email and username match an existing user

#### Reset Password Endpoint

**Location:** `/apps/server/src/app/api/auth/reset-password/route.ts`

- **Method:** POST
- **Endpoint:** `/api/auth/reset-password`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "newPassword": "newpassword123"
  }
  ```
- **Response:** Updates the user's password with proper scrypt hashing (same as Better Auth default)

### 3. UI Enhancements

#### Updated CSS

**Location:** `/apps/web/src/app/(auth)/auth.module.css`

Added styles for:

- `.successMessage` - Green-themed success notification box
- `.register` - Link styling for navigation between auth pages
- Fixed `.errorMessage` display property

#### Updated Login Page

**Location:** `/apps/web/src/app/(auth)/login/page.tsx`

- Added "Forgot Password?" link that navigates to the new forgot password page
- Link styled to match the existing auth theme

## How It Works

1. **User clicks "Forgot Password?" on login page**

   - Redirects to `/forgot-password`

2. **Step 1: Identity Verification**

   - User enters email and username
   - System verifies credentials match an existing account
   - If valid, proceeds to Step 2

3. **Step 2: Set New Password**
   - User enters new password and confirms it
   - Client-side validation:
     - Password must be at least 6 characters
     - Passwords must match
   - Server-side password hashing using scrypt
   - Database updated with new password
   - Success message displayed
   - Auto-redirect to login page after 2 seconds

## UI Design

### Color Scheme

- **Background:** Dark purple gradient (`#2c1654` → `#3a1e5c` → `#4a2472`)
- **Form Container:** Dark semi-transparent with glassmorphism effect
- **Inputs:** White background with dark text for readability
- **Text:** White text with subtle shadows
- **Success Messages:** Green-themed (`rgba(87, 255, 87, 0.2)`)
- **Error Messages:** Red-themed (`rgba(255, 87, 87, 0.2)`)

### Layout

- Form centered both horizontally and vertically
- Max-width: 450px
- Fully responsive for mobile devices
- Smooth transitions and fade-in animations

## Security Features

1. **Password Hashing:** Uses scrypt algorithm (Node.js crypto) with salt
2. **Input Validation:** Both client-side and server-side validation
3. **Error Handling:** Generic error messages to prevent user enumeration
4. **Two-Factor Verification:** Requires both email AND username to reset password

## Testing the Feature

1. Navigate to the login page: `/login`
2. Click "Forgot Password?" link
3. Enter your email and username
4. Click "Verify Identity"
5. If credentials match, enter a new password (min 6 characters)
6. Confirm the new password
7. Click "Reset Password"
8. You'll be redirected to login with your new password

## Notes

- The form uses the same styling system as login and signup pages for consistency
- All icons use BoxIcons (`bx` classes) - ensure the BoxIcons library is loaded
- Environment variable `NEXT_PUBLIC_SERVER_URL` must be set for API calls to work
- The MongoDB database must be connected and the `user` collection must exist
