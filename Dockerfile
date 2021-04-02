FROM node:lts-slim

RUN apt-get update \
  && mkdir -p /usr/share/man/man1 \
  && mkdir -p /app \
  && apt-get install -y openjdk-8-jre-headless

ENV JAVA_HOME=/usr

WORKDIR /app

COPY ./package.json .
RUN npm i
COPY . .

EXPOSE 7000

CMD ["npm", "start"]
