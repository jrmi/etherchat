# specify the node base image with your desired version node:<version>
FROM node:12
WORKDIR /etherchat

RUN git clone https://github.com/jrmi/etherchat.git /etherchat

RUN npm i \
    && npm run build

EXPOSE 4000
ENTRYPOINT ["node", "server/index.js"]
