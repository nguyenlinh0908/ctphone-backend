FROM node:18.17.1

WORKDIR /htdocs/ctphone

COPY . .

RUN apt-get update && apt-get install -y vim

RUN rm -rf node_modules && rm -rf yarn.lock

RUN cp .env.docker .env

RUN yarn

RUN yarn build

EXPOSE 32001

CMD [ "node", "dist/main.js" ]