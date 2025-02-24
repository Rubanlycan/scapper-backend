# Use Playwright's official image (includes Chromium, Firefox, WebKit)
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory to the root
WORKDIR /

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

RUN npx playwright install --with-deps

# Copy all files from root
COPY . .

# Expose the port Render will use
EXPOSE 3000

# Start the server (ensure index.js is in root)
CMD ["node", "index.js"]
