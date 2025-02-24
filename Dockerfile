# Use Playwright's official image with required dependencies
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Install missing dependencies manually
RUN apt-get update && apt-get install -y libnss3 libatk1.0-0 libx11-xcb1 libxcb-dri3-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2

# Set working directory to root (since you don’t use /app)
WORKDIR /

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Ensure Playwright browsers are installed
RUN npx playwright install --with-deps

# Copy all other files from root
COPY . .

# Expose the port Render will use
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
