# build environment
FROM node:lts-slim as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
COPY tsconfig*.json ./
COPY . ./
RUN npm ci
RUN npm run build

# production environment
FROM node:lts-slim
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./
COPY --from=build /app/src/.generated ./.generated
COPY --from=build /app/prisma ./prisma
RUN npm ci --omit=dev
USER 1000
CMD ["npm", "run", "prod:deploy"]