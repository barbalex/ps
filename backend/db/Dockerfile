FROM postgis/postgis:18-3.6

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# Install temporal_tables extension
# see: https://pgxn.org/dist/temporal_tables/
RUN apt-get -qq update
# needed for building pgxnclient, see: https://stackoverflow.com/a/61877103/712005
RUN apt-get install postgresql-server-dev-18 -y -qq
# Install pgxnclient using apt-get, not pip
RUN apt-get update && apt-get install -y \
  pgxnclient \
  build-essential \
  git \
  && rm -rf /var/lib/apt/lists/*
# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install temporal_tables


