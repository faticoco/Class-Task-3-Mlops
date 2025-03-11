FROM node:14

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install


COPY . .

# Set environment variables for watch mode
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=false

EXPOSE 3000

# Run with watch mode for development
CMD ["npm", "start"]