FROM node:20

WORKDIR /app
COPY . .

# ARG DATABASE_URL
# ENV DATABASE_URL=postgres://postgres:dAfAhiXchQVPsHdOWv6Rtw84UeQ5IPZ2E3Gg6C2WdOwKYlcUD71wofMxWBPErY1Y@192.168.4.138:5432/postgres

RUN npm install

CMD ["npm", "run", "dev"]
