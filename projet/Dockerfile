# Filename: Dockerfile

# Stage 1: Build Stage (install dependencies)
# Use a slim Node.js image as the base for building.
# This stage is optimized for installing dependencies efficiently.
FROM node:20-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have one)
# This is done first to leverage Docker's caching.
# If these files don't change, npm install won't re-run on subsequent builds.
COPY package*.json ./

# Install production dependencies
# The --omit=dev flag ensures only necessary dependencies for running the app are installed,
# leading to a smaller final image.
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Stage (run the application)
# Use a very lean Alpine-based Node.js image for the final production image.
# Alpine images are much smaller than Debian-based images.
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the installed node_modules from the builder stage
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY swagger.yaml ./swagger.yaml
COPY swagger.yaml ./dist/swagger.yaml

# Copy the rest of the application code
# Ensure .dockerignore is correctly configured to exclude unnecessary files (like node_modules in host)
# COPY . .

# Expose the port your Express app listens on
# This informs Docker that the container listens on this port.
# It doesn't publish the port to the host, that's done with `docker run -p`.
EXPOSE 5000

# Define the command to run the application
# Use `node index.js` directly as PID 1 to ensure proper signal handling (e.g., graceful shutdown).
CMD ["npm", "start"]