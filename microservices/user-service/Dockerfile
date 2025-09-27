FROM node:18-alpine

WORKDIR /app

# Install Python and make (needed for bcrypt compilation)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Rebuild bcrypt for Alpine Linux
RUN npm rebuild bcrypt --build-from-source

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3011

# Start the application
CMD ["npm", "start"]
