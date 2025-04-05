FROM debian:latest

RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/exports/linux-x64.zip ./perseusfs.zip

RUN unzip perseusfs.zip && rm perseusfs.zip && chmod +x perseusfs

CMD ["./perseusfs"]