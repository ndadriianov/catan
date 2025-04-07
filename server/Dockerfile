FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN wget https://raw.githubusercontent.com/eficode/wait-for/master/wait-for -O wait-for
RUN chmod +x wait-for

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "./wait-for db:5432 -- npm start"]