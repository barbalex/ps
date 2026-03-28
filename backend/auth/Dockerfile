# see: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
FROM node:25.8.2-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends dumb-init \
	&& rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/auth_app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

# Bundle app source
COPY --chown=node:node . .

EXPOSE 3003

USER node

CMD ["dumb-init", "node", "server.mjs" ]