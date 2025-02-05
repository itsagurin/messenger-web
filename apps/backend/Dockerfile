FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm ci
RUN npx prisma generate

COPY init.sh .
RUN chmod +x init.sh

EXPOSE 4000

CMD ["./init.sh"]
