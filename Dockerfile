# Use Playwright's official image
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Ensure all system dependencies are installed
RUN apt-get update && apt-get install -y libnss3 libatk1.0-0 libx11-xcb1 libxcb-dri3-0 \
    libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2

# Set working directory
WORKDIR /

# Copy dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Force Playwright to install browsers manually
RUN npx playwright install chromium --with-deps

# Copy all files
COPY . .

# Expose the port
EXPOSE 3000

# Run Playwright installation again at runtime (Render fix)
CMD npx playwright install chromium --with-deps && node index.js
