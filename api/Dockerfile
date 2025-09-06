# api/Dockerfile

# --- Build Stage ---
# Use a Node.js image that includes a full OS to build our app
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# --- Production Stage ---
# Use a lightweight Node.js image for the final container
FROM node:20-alpine

WORKDIR /app
RUN mkdir uploads
# Copy only the necessary files from the build stage
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# The command to run the compiled JavaScript app
CMD ["node", "dist/index.js"]