#!/bin/sh

# This script updates the env-config.js file with actual environment variables at container startup

# Path to the env-config.js file
ENV_CONFIG_FILE=/app/build/client/env-config.js

# Check if the file exists
if [ -f "$ENV_CONFIG_FILE" ]; then
  echo "Updating environment variables in $ENV_CONFIG_FILE"
  
  # Replace placeholders with actual environment variables
  # Use sed to replace the placeholders with the actual values
  sed -i "s|__VITE_MEDUSA_BACKEND_URL__|$VITE_MEDUSA_BACKEND_URL|g" $ENV_CONFIG_FILE
  sed -i "s|__VITE_MEDUSA_PUBLISHABLE_KEY__|$VITE_MEDUSA_PUBLISHABLE_KEY|g" $ENV_CONFIG_FILE
  
  echo "Environment variables updated successfully"
else
  echo "Error: $ENV_CONFIG_FILE not found"
  exit 1
fi
