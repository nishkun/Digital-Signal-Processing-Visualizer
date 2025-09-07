# frontend/Dockerfile

# --- Build Stage ---
# Use a Node.js image to build the React app
FROM node:20 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the static files
RUN npm run build

# --- Production Stage ---
# Use a lightweight Nginx web server to serve the static files
FROM nginx:stable-alpine

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Add this line to copy your new Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose the port Nginx runs on
EXPOSE 80

# The default command to start Nginx is included in the base image