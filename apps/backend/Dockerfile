FROM node:18

WORKDIR /app

# Install dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy root package files first for better layer caching
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY apps/backend/package*.json ./apps/backend/
# Prisma is inside the backend directory based on your project structure
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Ensure init.sh is executable
RUN chmod +x ./apps/backend/init.sh

# Make sure bcrypt is properly installed (if needed)
RUN npm uninstall bcrypt --workspace=apps/backend && npm install bcrypt --workspace=apps/backend

EXPOSE 4000

# Use the init.sh script from the backend directory
CMD ["sh", "./apps/backend/init.sh"]