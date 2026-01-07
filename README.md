# ENOUGHH® E-commerce Frontend

A modern, full-featured e-commerce frontend application built with Next.js 15, React 19, and TypeScript. This application provides a complete shopping experience with product catalog, shopping cart, wishlist, order management, and an integrated admin panel.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products with advanced filtering (category, gender, price range)
- **Shopping Cart**: Persistent cart with real-time synchronization with backend
- **Wishlist**: Save favorite products and share wishlists via unique links
- **Order Management**: Track orders, view order history, and receive status updates
- **User Authentication**: Secure authentication with Supabase (sign up, sign in, password reset)
- **Payment Integration**: Seamless payment processing with Epayco
- **Product Variants**: Support for product sizes and variants with stock management
- **Responsive Design**: Mobile-first design with modern UI components

### Admin Features
- **Dashboard**: Comprehensive admin dashboard with analytics
- **Order Management**: Full order lifecycle management with status updates and shipping tracking
- **Product Management**: CRUD operations for products, variants, and inventory
- **Customer Management**: View and manage customer profiles and data
- **Analytics**: Business insights and statistics
- **Order Communication**: Internal messaging system for order-related communications

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 15.2.4**: React framework with App Router
- **React 19**: Latest React version
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4.1.9**: Utility-first CSS framework
- **Zustand 5.0.8**: Lightweight state management

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Geist Font**: Modern typography
- **Sonner**: Toast notifications
- **Recharts**: Data visualization for analytics

### Backend Integration
- **Supabase**: Authentication and user management
- **Custom API Client**: RESTful API integration
- **Epayco**: Payment gateway integration

### Development Tools
- **Vercel Analytics**: Performance monitoring
- **Vercel Speed Insights**: Performance optimization
- **React Hook Form**: Form management
- **Zod**: Schema validation

## 📁 Project Structure

```
Ecommerce/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── customers/     # Customer management
│   │   ├── orders/        # Order management
│   │   └── products/      # Product management
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── epayco/        # Payment processing
│   │   └── upload-image/  # Image upload
│   ├── checkout/          # Checkout page
│   ├── collections/       # Product collections
│   ├── my-orders/         # User order history
│   ├── payment-success/   # Payment confirmation
│   ├── products/          # Product listing
│   └── wishlist/          # Wishlist pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   └── types/            # TypeScript type definitions
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication context
│   └── ProductsContext.tsx # Products context
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api-client.ts     # API client implementation
│   ├── epayco.ts         # Epayco configuration
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── store/                # Zustand stores
│   ├── cartStore.ts      # Shopping cart state
│   ├── profileCacheStore.ts # Profile caching
│   ├── uiStore.ts        # UI state management
│   └── wishlistStore.ts  # Wishlist state
└── public/               # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ (or latest LTS version)
- npm, yarn, or pnpm package manager
- Supabase account and project
- Epayco account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd enoughh-frontend/Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001

   # Epayco Configuration
   NEXT_PUBLIC_EPAYCO_PUBLIC_KEY=your_epayco_public_key
   EPAYCO_PRIVATE_KEY=your_epayco_private_key
   EPAYCO_P_CUST_ID_CLIENTE=your_customer_id
   EPAYCO_P_KEY=your_epayco_key

   # Node Environment
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application uses Supabase for authentication with the following features:
- Email/password authentication
- User registration with profile creation
- Password reset functionality
- Role-based access control (admin, user, moderator)
- Session persistence
- Protected routes

## 🛒 Shopping Cart

The shopping cart is managed with Zustand and includes:
- Persistent cart storage (localStorage + backend sync)
- Real-time quantity updates
- Product variant support
- Price calculations with discounts
- Cart animations and UI feedback

## 💳 Payment Processing

Payment integration with Epayco supports:
- Credit/debit card payments
- Payment confirmation
- Order status updates
- Transaction verification
- Error handling and retry logic

## 👨‍💼 Admin Panel

The admin panel provides:
- **Orders**: View, update status, manage shipping, and communicate with customers
- **Products**: Create, edit, delete products and manage inventory
- **Customers**: View customer profiles and order history
- **Analytics**: Business metrics and insights
- Route protection with role-based access

## 🎨 Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming
- **Dark mode support** via next-themes
- **Responsive design** for all screen sizes
- **Custom animations** for enhanced UX

## 🔄 State Management

State is managed using:
- **Zustand** for global state (cart, UI, wishlist)
- **React Context** for authentication and products
- **React Hook Form** for form state
- **Local Storage** for persistence

## 📦 Key Components

### UI Components
- `Header` - Navigation and user menu
- `ShoppingCart` - Cart sidebar with checkout
- `ProductCard` - Product display card
- `ProductFilters` - Advanced filtering system
- `CreditCardForm` - Payment form
- `OrderTracking` - Order status tracking

### Admin Components
- `AdminDashboard` - Main admin interface
- `AdminOrders` - Order management
- `AdminProducts` - Product management
- `AdminCustomers` - Customer management
- `AdminAnalytics` - Analytics dashboard
- `OrderDetailsModal` - Detailed order view

## 🔌 API Integration

The application communicates with a backend API through:
- Custom `api-client.ts` with centralized error handling
- RESTful endpoints for CRUD operations
- Token-based authentication
- Request/response interceptors
- Automatic token refresh

## 🧪 Type Safety

Full TypeScript support with:
- Strict type checking
- Interface definitions for all data models
- Type-safe API responses
- Component prop types

## 🚀 Deployment

The application is optimized for deployment on Vercel:
- Automatic builds and deployments
- Environment variable configuration
- Analytics and performance monitoring
- Image optimization

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For contributions, please contact the project maintainers.

## 📞 Support

For support and questions, please contact the development team.

---

Built with ❤️ for https://github.com/davideliaspalacio

