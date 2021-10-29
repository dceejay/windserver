FROM node:fermium-slim

RUN apt-get update \
  && mkdir -p /app \
  && mkdir -p /usr/share/man/man1 \
  && apt-get install -y openjdk-8-jre-headless

WORKDIR /app

COPY ./package.json .
RUN npm i
COPY . .

ENV JAVA_HOME=/usr

EXPOSE 7000

CMD ["npm", "start"]
