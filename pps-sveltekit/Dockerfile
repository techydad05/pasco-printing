FROM node:20

WORKDIR /app
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=file:local.db

RUN npm install
RUN npm run build

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
