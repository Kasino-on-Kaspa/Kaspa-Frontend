FROM node:20 AS builder

WORKDIR /app

# Build arguments for environment variables
ARG VITE_CMC_API_KEY
ARG VITE_BACKEND_URL
ARG VITE_SOCKET_URL
ARG NODE_ENV=production

# Set environment variables
ENV VITE_CMC_API_KEY=$VITE_CMC_API_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV NODE_ENV=$NODE_ENV

# Install dependencies first (better layer caching)
COPY package*.json ./
ENV HUSKY=0
RUN npm install --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 8080
CMD ["nginx", "-g", "daemon off;"]
