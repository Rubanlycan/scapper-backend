# Use an official Node.js image
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set the working directory to the root
WORKDIR /

# Copy package.json and yarn.lock first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all files from the root directory
COPY . .

# Expose the correct port
EXPOSE 3000

# Start the server
CMD ["yarn", "start"]
