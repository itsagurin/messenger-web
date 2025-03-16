# Full-stack Chat Application with Subscriptions

This project is a full-stack application featuring user authentication, real-time chat functionality, and subscription management. It uses Docker Compose to manage multiple services including a Nest.js backend, React frontend, and Directus admin panel.

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
- TypeScript

### Frontend
- React.js
- TypeScript

### Infrastructure
- Docker & Docker Compose
- Directus (Admin Panel)
- Turborepo **(IMPORTANT: only for local development, NOT related to Docker | doesn't run Directus, only front + back!)**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Docker and Docker Compose
- Node.js (v18 or later)
- Git

## 🔑 Environment Variables

Create a `.env` file in the root directory using `.env.example`

### To use Turborepo:

Create a `.env.local` file in the backend and frontend directory using `.env.local.example`
**IMPORTANT: If you run the project locally via Turborepo, the stripe listener must be started separately with the command:**
```bash
stripe listen --api-key STRIPE_SECRET_KEY --forward-to localhost:4000/payment/webhook
```

## 🚀 Getting Started
   
1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. If you want the database to be automatically populated with fixtures, then in `.env` select
```bash
SEED_DATABASE=true
```

3. Start the services using Docker Compose:
```bash
docker compose up --build
```

This will start all services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Directus Admin: http://localhost:8055
- PostgreSQL: http://localhost:5432

## 📚 Additional Resources

For those new to React/Nest.js:
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Next.js Documentation](https://docs.nestjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License
