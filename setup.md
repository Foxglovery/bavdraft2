# BAVdraft2 Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Update `src/services/firebase.js` with your Firebase configuration
   - Enable Firestore Database and Authentication in Firebase Console

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Firebase Configuration

Replace the placeholder configuration in `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Initial Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)

2. **Create Test Users**
   - In Firebase Console, go to Authentication > Users
   - Click "Add User"
   - Create test users for different roles:
     - `admin@bakery.com` (Admin)
     - `bakery@bakery.com` (Bakery)
     - `fulfillment@bakery.com` (Fulfillment)
     - `retail@bakery.com` (Retail)

3. **Set up Firestore Collections**
   The app will automatically create collections as needed, but you can pre-populate:
   - `products` - Product catalog
   - `oilBatches` - Oil batch tracking
   - `users` - User management

4. **Create Admin User in App**
   - Use the Admin Dashboard to add your first admin user
   - Set up products and oil batches

## Testing the Application

1. **Login with Test Users**
   - Use any of the test users created in Firebase Auth
   - Navigate between different dashboards using the navigation buttons

2. **Admin Setup (First Time)**
   - Login as admin user
   - Go to Admin Dashboard
   - Add products and oil batches
   - Create additional users if needed

3. **Test Different Roles**
   - Bakery Dashboard: Create batches, manage retail requests
   - Fulfillment Dashboard: Process packaging actions
   - Retail Dashboard: Submit product requests
   - Admin Dashboard: Manage users, products, and view reports

## Troubleshooting

If you encounter npm issues:
1. Make sure Node.js is installed (v16 or higher)
2. Try using `yarn` instead of `npm`
3. Check your PowerShell execution policy
4. Use Command Prompt instead of PowerShell

If you encounter authentication issues:
1. Make sure Firebase Authentication is enabled
2. Verify the Firebase configuration is correct
3. Check that users are created in Firebase Auth
4. Ensure Firestore rules allow read/write access

## Development Notes

- The app uses React 18.3.1 with Material UI v5.15.14
- All Firebase operations are handled in `src/services/firebase.js`
- Role-based access control is implemented through user roles
- Batch codes are auto-generated using the specified format
- Authentication state is managed globally in the App component
