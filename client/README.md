# QR Ordering System - ReactJS Frontend

A comprehensive QR Code Ordering Website System built with ReactJS, featuring separate interfaces for Customers, Staff, and Administrators.

## 🎯 Features

### Customer Interface (No Login Required)
- **QR Ordering View**: Browse menu items with images, prices, and descriptions
- **Cart Management**: Add, remove, and update quantities
- **Order Submission**: Submit orders with prominent "Gửi đơn hàng" button
- **Real-time Order Status**: Track order status (Pending, In Preparation, Served)

### Staff Interface
- **Login System**: Secure authentication with JWT tokens
- **Order Management Dashboard**: Real-time order list with table numbers and statuses
- **Order Processing**: Update order status (Pending → In Preparation → Served)
- **Order Details View**: Detailed view of selected orders

### Admin Interface
- **Menu Management**: Add, edit, and delete menu items (mon_an)
- **Table Management**: Add, edit, and delete dining tables (ban_an)
- **Revenue Statistics**: 
  - Filter by day or month
  - Interactive charts (Line and Bar charts)
  - Detailed revenue data tables
  - Summary cards (Total revenue, Average revenue, Total orders)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/           # Admin interface components
│   │   ├── MenuManagement.jsx
│   │   ├── MenuForm.jsx
│   │   ├── TableManagement.jsx
│   │   ├── TableForm.jsx
│   │   └── RevenueStatistics.jsx
│   ├── customer/        # Customer interface components
│   │   ├── MenuItem.jsx
│   │   ├── OrderCart.jsx
│   │   └── OrderStatus.jsx
│   ├── staff/           # Staff interface components
│   │   ├── OrderList.jsx
│   │   ├── OrderCard.jsx
│   │   └── OrderDetail.jsx
│   └── common/          # Shared components
│       └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx  # Authentication context
├── pages/               # Page components
│   ├── CustomerOrdering.jsx
│   ├── StaffLogin.jsx
│   ├── StaffDashboard.jsx
│   └── AdminDashboard.jsx
├── App.jsx              # Main app component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🔐 Authentication & Authorization

The system uses JWT tokens for authentication. User roles include:
- **Customer**: No authentication required (accessed via QR code)
- **Staff**: Order management access
- **Admin**: Full management access (Menu, Tables, Revenue)

### Demo Credentials
- **Admin**: Username `admin` (any password for demo)
- **Staff**: Any other username (any password for demo)

## 🎨 Design Features

- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with gradient headers
- **Real-time Updates**: Order status updates reflect across the system
- **Role-based Access**: Different dashboards based on user role
- **Vietnamese Language**: All UI text in Vietnamese

## 🔌 API Integration

The components are set up with placeholder API calls. Replace the mock data with actual API endpoints:

### Example API Endpoints:
- `GET /api/menu` - Fetch menu items
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/revenue` - Get revenue statistics
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item
- Similar endpoints for tables management

## 📱 Routes

- `/order/:tableId` - Customer ordering interface
- `/staff/login` - Staff login page
- `/staff/dashboard` - Staff order management dashboard
- `/admin/dashboard` - Admin management dashboard

## 🛠️ Technologies Used

- **React 18** - UI library
- **React Router v6** - Routing
- **Vite** - Build tool
- **Recharts** - Chart library for statistics
- **date-fns** - Date formatting
- **JWT Decode** - Token decoding

## 📝 Notes

- All components use mock data for demonstration
- Replace API calls with actual backend endpoints
- Image URLs use placeholder services - replace with actual image storage
- JWT authentication is mocked - integrate with actual auth server
- Real-time features use polling - consider WebSockets for production

## 🎯 Next Steps

1. Connect to backend API endpoints
2. Implement WebSocket for real-time order updates
3. Add image upload functionality for menu items
4. Implement file upload for table QR codes
5. Add error handling and loading states
6. Implement proper JWT refresh token handling
7. Add unit and integration tests

## 📄 License

This project is part of a QR Code Ordering System development project.



