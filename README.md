<p align="center">
  A party games web app inspired by jackbox games. This is a new version of the project built with a react front end and a node.js/mongodb back end. See original version of the project <a href="https://github.com/jcubby86/games">here</a>.
</p>

## Features

- **Games:**
  - The Name Game: Everyone secretly enters the name of a person (real or fictional) that others would know. Players then take turns guessing each other's names until only one remains!
  - He Said She Said: Each player answers the same six prompts. Stories are then built randomly using different players' answers for each prompt.
- **Pairing:** One person can create a game and invite others to join with a four-letter code
- **Auto-generated nicknames:** Players can create their own nicknames or use a randomly generated phrase
- **Suggestions:** Each prompt for the games will suggest something if you can't think of what to put

## Self Hostable

- I built this website to be fully self-hostable, with a docker image for front-end and backend, fully customizable with environment variables

Using docker compose:

```yaml
version: "3"
services:
  app:
    image: ghcr.io/jcubby86/games-app:latest
    ports:
      - "3020:80"
    environment:
      - NGINX_BACKEND_ADDRESS=http://backend:3000
    restart: unless-stopped
    depends_on: 
      - backend
      - db

  backend:
    image: ghcr.io/jcubby86/games-backend:latest
    environment:
      - MONGO_DB_CONN_STR=mongodb://db/games
      - NODE_PORT=3000
    depends_on: 
      - db
    healthcheck:
      test:  wget --spider --tries=1 --no-verbose http://localhost:3000/api/health
      interval: 5s
      retries: 5
      start_period: 5s
      timeout: 10s
    restart: unless-stopped
      
  db:
    image: mongo:latest
    volumes:
    - /data/mongo:/data/db
    restart: unless-stopped
    
  db-seed:
    image: byrnedo/alpine-curl
    command: "-X POST --silent http://backend:3000/api/seed"
    depends_on:
      backend:
        condition: service_healthy
      db:
        condition: service_started
```

Environment variables for each container can be configured for each service to run on different ports
