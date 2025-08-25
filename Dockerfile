# Use a Node.js base image for building the React app
FROM node:alpine as builder

# Install pnpm
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install project dependencies
RUN pnpm install --frozen-lockfile

# Copy the entire React application code
COPY . .

# Build the React application for production
RUN echo "=== Starting Vite build ===" && \
    pnpm exec vite build --mode production && \
    echo "=== Vite build completed ==="

# Use a lightweight Nginx image to serve the static build
FROM nginx:alpine

# Copy the built React app from the builder stage to Nginx's web root
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]