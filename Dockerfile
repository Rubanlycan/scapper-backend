# Use base Playwright image
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /

# Install dependencies (explicitly install Chromium)
RUN apt-get update && apt-get install -y wget unzip libnss3 libatk1.0-0 libx11-xcb1 \
  libxcb-dri3-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 && \
  rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Force Playwright to install Chromium
RUN npx playwright install chromium --with-deps

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
