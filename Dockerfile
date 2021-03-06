FROM node:16 AS build
WORKDIR /root/
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
