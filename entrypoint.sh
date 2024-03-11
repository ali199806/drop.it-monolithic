#!/bin/sh

# Start the frontend (React) server
cd /usr/src/app/frontend
npm start &

# Start the backend (Express) server
cd ../backend
node server.js
