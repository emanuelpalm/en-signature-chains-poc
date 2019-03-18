FROM node:8

WORKDIR /opt

ADD demo ./demo
ADD target ./target
ADD www ./www
ADD package.json package-lock.json ./
RUN npm install --only=production

EXPOSE 8080 8082 8084
CMD bash ./demo/start.sh
