# Use an official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app
COPY . .

# Copy package.json and package-lock.json for frontend
# COPY frontend/package*.json ./frontend/
WORKDIR /usr/src/app/frontend
RUN npm install

# Build the React app
RUN npm run build

# Switch back to the root directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for backend
# COPY backend/package*.json ./backend/
WORKDIR /usr/src/app/backend
RUN npm install

# Copy the rest of the application code
COPY . .
# Copy the entrypoint script
WORKDIR /usr/src/app/backend

# Make port 80 available to the world outside this container
EXPOSE 80

# Specify the entry point for the container
CMD ["node", "server.js"]
