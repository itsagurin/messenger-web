# Full-stack Chat Application with Subscriptions

This project is a full-stack application featuring user authentication, real-time chat functionality, and subscription management. It uses Docker Compose and Turborepo to manage multiple services including a Nest.js backend, React frontend, and Directus admin panel.

## 🚀 Features

- User authentication (registration and login)
- Real-time chat between users using WebSocket
- Subscription management with Stripe integration
- Admin panel for moderators (Directus)
- Docker containerization for easy deployment
- TypeScript support throughout the application

## 🛠 Tech Stack

### Backend
- Nest.js
- PostgreSQL
- WebSocket
- Stripe API

### Frontend
- Next.js (React framework)
- ChakraUI
- TypeScript

### Infrastructure
- Docker & Docker Compose
- Turborepo
- Directus (Admin Panel)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Docker and Docker Compose
- Node.js (v18 or later)
- Git

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# PostgreSQL
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database

# Nest.js
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_test_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Directus
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Start the services using Docker Compose:
```bash
docker compose up
```

This will start all services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Directus Admin: http://localhost:8055

## 📂 Project Structure

```
.
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # Nest.js backend
│   └── admin/              # Directus configuration
├── packages/               # Shared packages
├── docker/                # Docker configuration files
├── docker-compose.yml     # Docker Compose configuration
├── turbo.json             # Turborepo configuration
└── package.json           # Root package.json
```

## 🔍 Key Components For React Newcomers

### Frontend Structure (Next.js/React)
The frontend is built with Next.js, a React framework. Here's what you need to know:

1. **Pages**: Located in `apps/web/pages/`
    - `_app.tsx`: Main application wrapper
    - `index.tsx`: Home page
    - `login.tsx`: Login/Registration page
    - `profile.tsx`: User profile page
    - `chats.tsx`: Chat interface
    - `subscriptions.tsx`: Subscription plans

2. **Components**: Located in `apps/web/components/`
    - Reusable UI elements
    - Each component is a separate function returning JSX

3. **Basic React Concepts**:
   ```jsx
   // Example component
   const ChatMessage = ({ message, sender }) => {
     return (
       <div className="message">
         <strong>{sender}:</strong>
         <p>{message}</p>
       </div>
     );
   };
   ```

## 💻 Development

### Running in Development Mode

1. Install dependencies:
```bash
npm install
```

2. Start development servers:
```bash
npm run dev
```

### Working with the Database

The application uses PostgreSQL. Initial fixtures are provided to populate the database with test data:

```bash
docker compose exec api npm run seed
```

This will create 10 test users and sample chat messages.

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:userId` - Get chat with specific user
- `POST /api/chats/:userId/messages` - Send message
- WebSocket connection at `ws://localhost:8000/chat`

### Subscriptions
- `GET /api/subscriptions` - Get available plans
- `POST /api/subscriptions` - Create subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

## 🧪 Testing

Run tests for all applications:
```bash
npm run test
```

## 📚 Additional Resources

For those new to React/Next.js:
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [ChakraUI Documentation](https://chakra-ui.com/docs/getting-started)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.