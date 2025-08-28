# BAVdraft2 - Bakery Management System

A comprehensive React-based bakery management system with role-based dashboards for bakery, fulfillment, retail, and admin operations.

## 🚀 Features

### 🍞 Bakery Dashboard
- **Batch Creation**: Create new production batches with product selection, oil batch management, and quantity tracking
- **Retail Requests**: View and fulfill pending retail requests
- **Production Log**: Track daily production activities
- **Auto-generated Batch Codes**: Automatic batch code generation using the specified format

### 📦 Fulfillment Dashboard
- **Packaging Actions**: Process packaging with product and batch selection
- **Batch Management**: View last 3 batches (oldest first) for each product
- **Two Modes**: Instant submit or batch submit at day's end
- **Inventory Tracking**: Real-time inventory updates
- **Fulfillment Logs**: Daily activity tracking

### 🛍️ Retail Dashboard
- **Product Requests**: Submit requests for products with quantities
- **Request History**: View all past requests with status tracking
- **Status Management**: Track pending, fulfilled, and cancelled requests

### 🛠️ Admin Dashboard
- **User Management**: Add, edit, and remove users with role assignment
- **Product Management**: Manage product catalog with full CRUD operations
- **Oil Batch Management**: Track oil batches used in production
- **Reports**: View system activity and inventory status
- **Inventory Adjustment**: Manual inventory corrections

## 🛠️ Tech Stack

- **React**: 18.3.1
- **Material UI**: v5.15.14
- **Firebase**: Firestore + Authentication
- **Vite**: Build tool and development server
- **React Router**: Navigation and routing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bavdraft2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication
   - Copy your Firebase configuration
   - Update `src/services/firebase.js` with your configuration:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Set up Firestore Collections**
   The app expects the following collections:
   - `products` - Product catalog
   - `oilBatches` - Oil batch tracking
   - `batches` - Production batches
   - `inventory` - Current inventory levels
   - `fulfillmentLogs` - Daily fulfillment activities
   - `retailRequests` - Retail product requests
   - `users` - User management

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📊 Firestore Schema

### Products Collection
```javascript
{
  "name": "Chocolate Chip Cookie",
  "acronym": "CCC",
  "code": "100D9CCC",
  "unit": "pcs"
}
```

### Oil Batches Collection
```javascript
{
  "number": "9999",
  "type": "D9",
  "createdAt": "timestamp"
}
```

### Batches Collection
```javascript
{
  "code": "100D9CCC-DC9999-08-23-25",
  "productId": "CCC",
  "oils": [{ "oilBatchId": "9999", "type": "D9", "ratio": 100 }],
  "quantity": 500,
  "remaining": 500,
  "createdAt": "timestamp"
}
```

### Inventory Collection
```javascript
{
  "productId": "CCC",
  "totalAvailable": 1200,
  "lastUpdated": "timestamp"
}
```

### Fulfillment Logs Collection
```javascript
{
  "date": "2025-08-23",
  "actions": [
    { "productId": "CCC", "batchId": "100D9CCC-DC9999-08-23-25", "quantity": 200, "userId": "fulfillmentUser1" }
  ]
}
```

### Retail Requests Collection
```javascript
{
  "requestedBy": "retailUser1",
  "productId": "CCC",
  "quantity": 50,
  "status": "pending",
  "createdAt": "timestamp"
}
```

### Users Collection
```javascript
{
  "email": "staff@bakery.com",
  "role": "bakery" // bakery | fulfillment | retail | admin
}
```

## 🔧 Batch Code Generation

The system uses the following format for batch codes:
```
{productCode}-DC{oilBatchNumber}-{MM}-{DD}-{YY}
```

Example: `100D9CCC-DC9999-08-23-25`

## 🎯 Usage

1. **Admin Setup**: First, use the Admin Dashboard to:
   - Add users with appropriate roles
   - Create products in the catalog
   - Add oil batches

2. **Bakery Operations**: Use the Bakery Dashboard to:
   - Create production batches
   - Manage retail requests
   - Track production

3. **Fulfillment Operations**: Use the Fulfillment Dashboard to:
   - Process packaging actions
   - Manage inventory deductions
   - Track daily activities

4. **Retail Operations**: Use the Retail Dashboard to:
   - Submit product requests
   - View request history

## 🔐 Authentication

The app uses Firebase Authentication. Users need to be created in Firebase Auth and their roles managed through the Admin Dashboard.

## 📱 Responsive Design

The application is fully responsive and works on desktop, tablet, and mobile devices using Material UI's responsive grid system.

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your preferred hosting service:
   - Firebase Hosting
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
