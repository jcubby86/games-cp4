# build environment
FROM node:lts-slim as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
COPY tsconfig*.json ./
COPY . ./
RUN npm ci
RUN npx prisma generate
RUN npm run build

# production environment
FROM node:lts-slim
WORKDIR /app
ENV NODE_PORT=3000
EXPOSE $NODE_PORT
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/src/.generated ./.generated
COPY --from=build /app/prisma ./prisma
RUN npm ci --omit=dev
RUN apt-get update -y && apt-get install -y openssl curl
RUN chown -R 1000:1000 /app
USER 1000
HEALTHCHECK --interval=5s --timeout=10s --start-period=5s --retries=5 \
  CMD curl -f --max-time 8 --silent http://localhost:${NODE_PORT}/health || exit 1
CMD ["npm", "run", "prod:deploy"]