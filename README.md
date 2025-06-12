# Byte2Bite - Food Waste Management Platform

A comprehensive platform that connects food donors with NGOs to reduce food waste and help communities in need.

## 🚀 Features

- **User Authentication**: Secure login/registration with email verification and OTP support
- **Role-based Access**: Separate dashboards for donors, NGOs, and administrators
- **Food Donation Management**: Create, manage, and track food donations
- **Real-time Matching**: Connect donors with nearby NGOs instantly
- **Impact Tracking**: Monitor environmental and social impact with detailed analytics
- **Profile Management**: Complete user profiles with document verification for NGOs
- **Responsive Design**: Beautiful, mobile-friendly interface

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Backend API**: RESTful API with JWT authentication

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see API documentation)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/byte2bite.git
   cd byte2bite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_BASE_URL=https://byte2bite-backend.onrender.com/api/v1
   VITE_NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 API Integration

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-tokens` - Refresh access token
- `GET /auth/me` - Get current user

### OTP Management

- `POST /otp/getOTP` - Send OTP via email/SMS
- `POST /otp/verifyOTP` - Verify OTP code

### User Management

- `POST /user/complete-profile` - Complete user profile
- `POST /user/upload/profilePicture` - Upload profile picture
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### Dashboard

- `GET /dashboard/overview` - Get dashboard statistics

## 📱 User Roles

### Donors (Restaurants, Cafes, Food Businesses)
- Create food donation listings
- Track donation status
- View impact metrics
- Manage pickup schedules

### NGOs (Non-Profit Organizations)
- Browse available donations
- Accept and manage donations
- Track distribution impact
- Verify organization credentials

### Administrators
- Manage user verifications
- Monitor platform activity
- Generate system reports
- Handle disputes

## 🎨 Design Features

- **Modern UI**: Clean, professional design with emerald green theme
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Charts**: Real-time data visualization
- **Accessibility**: WCAG compliant design patterns

## 📊 Impact Tracking

The platform tracks various metrics:
- **Food Saved**: Total weight of food rescued
- **People Fed**: Number of individuals served
- **CO₂ Reduced**: Environmental impact calculation
- **Growth Rate**: Platform usage trends

## 🔐 Security Features

- JWT-based authentication
- Automatic token refresh
- Secure file uploads
- Input validation and sanitization
- Role-based access control

## 📦 Build and Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

3. **Deploy to your hosting platform**
   - The `dist` folder contains the production build
   - Configure your hosting to serve the SPA correctly

## 🧪 Testing with Postman

Import the provided Postman collection and environment:

1. **Collection**: `postman/Byte2Bite_Fixed.postman_collection.json`
2. **Environment**: `postman/Byte2Bite.postman_environment.json`

The collection includes:
- Authentication flows
- User management
- OTP verification
- Dashboard endpoints
- Automatic token refresh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Muhammad Burhan Hussain** - Frontend Developer (21-CS-50)
- **Muhammad Shehroz Sarmad** - Backend Developer (21-CS-59)

## 📞 Support

For support, email support@byte2bite.com or create an issue in the repository.

## 🌟 Acknowledgments

- Thanks to all contributors who helped build this platform
- Special thanks to the open-source community for the amazing tools and libraries
- Inspired by the global mission to reduce food waste and fight hunger

---

**Byte2Bite** - Reducing Food Waste, One Byte at a Time 🌱