# FROM postgis/postgis:17-3.5
# FROM postgis/postgis:18-3.6 errored, something about upgrades
FROM postgis/postgis:18-3.6
# FROM postgres:18-alpine

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# Install temporal_tables extension
# see: https://pgxn.org/dist/temporal_tables/
RUN apt-get -qq update
# needed, see: https://stackoverflow.com/a/61877103/712005
RUN apt-get install postgresql-server-dev-18 -y -qq
# RUN apt-get install python3-pip -y -qq
# see: https://pgxn.github.io/pgxnclient/install.html
# RUN pip install pgxnclient
# Install pgxnclient using apt-get, not pip
RUN apt-get update && apt-get install -y \
  pgxnclient \
  build-essential \
  git \
  && rm -rf /var/lib/apt/lists/*
# RUN apt-get install python3-pgxnclient -y -qq
# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install temporal_tables


