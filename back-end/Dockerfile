# build environment
FROM node:alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci
COPY . ./
RUN npm run build

# production environment
FROM node:alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./
RUN npm ci --only=production
USER 1000
CMD ["server.js"]