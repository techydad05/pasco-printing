FROM node:20

WORKDIR /app
COPY . .

# Make the update-env.sh script executable
RUN chmod +x update-env.sh

RUN npm install
RUN npm run build

# Create a startup script that runs the update-env script before starting the app
RUN echo '#!/bin/sh\n\n# Run the update-env script\n./update-env.sh\n\n# Start the application\nexec node build' > /app/start.sh \
    && chmod +x /app/start.sh

# Use the startup script as the entry point
CMD ["/app/start.sh"]
