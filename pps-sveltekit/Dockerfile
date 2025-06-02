FROM node:20

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
