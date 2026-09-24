FROM node:22-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this step between builds
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]
