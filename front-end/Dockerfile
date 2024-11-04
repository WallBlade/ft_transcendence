# Use an official Node.js runtime as the base image
FROM node:alpine

# Install openSSL
RUN apk --no-cache add openssl

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the project files into the container
COPY . .

# Create a directory to store the profile pictures
RUN mkdir -p /media/profile_pictures

# Copy the profile pictures into the container
COPY ./static/avatars/* /media/profile_pictures/

# Expose the port Vite uses
EXPOSE 3000

# Start the Vite development server
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]

