FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY turbo.json ./

COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

RUN npm ci
RUN npm install -g ts-node

COPY . .

RUN chmod +x ./apps/backend/init.sh

RUN npm uninstall bcrypt --workspace=apps/backend && npm install bcrypt --workspace=apps/backend

EXPOSE 4000

CMD ["sh", "./apps/backend/init.sh"]