FROM node:lts as build

RUN apt-get update \
  && apt-get install -y openjdk-8-jdk jq \
  && mkdir -p /app

ENV JAVA_HOME=/usr

WORKDIR /app

COPY ./package.json .
RUN npm i
COPY . .

EXPOSE 7000

CMD ["npm", "start"]
