FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN rm -rf node_modules

RUN npm cache clean --force
RUN npm ci

RUN npx prisma generate

COPY . .

COPY init.sh .
RUN chmod +x init.sh

RUN npm uninstall bcrypt && npm install bcrypt

EXPOSE 4000

CMD ["./init.sh"]