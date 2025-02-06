#!/bin/sh

# Run migrations
echo "Running database migrations..."
pnpm run db:migrate 

# Start the application
echo "Starting the application..."
exec pnpm start
