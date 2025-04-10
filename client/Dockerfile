FROM node:20-alpine AS build

WORKDIR /frontend-build

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /frontend

RUN npm install -g serve
COPY --from=build /frontend-build/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
