FROM node:20

WORKDIR /app
COPY . .

ARG DATABASE_URLL
ENV DATABASE_URLL=file:local.db

RUN npm install
RUN npm run build

CMD ["node", "build"]
