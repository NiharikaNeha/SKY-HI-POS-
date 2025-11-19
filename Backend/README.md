# SKY-HI Restaurant Backend API

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the Backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skyhi-restaurant
JWT_SECRET=your_jwt_secret_key_here_change_in_production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
FRONTEND_URL=http://localhost:5173
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (Admin only)
- `PATCH /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get single order
- `PATCH /api/orders/:orderId/status` - Update order status (Admin only)
- `GET /api/orders` - Get all orders (Admin only)

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/status/:orderId` - Get payment status

## Features

- User authentication with JWT
- Order management with status tracking
- QR code generation for payments
- Stripe payment integration
- Real-time order status updates

FW2wwR4UeuLhfOtJ