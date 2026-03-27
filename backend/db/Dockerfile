FROM postgis/postgis:17-3.5
# FROM postgis/postgis:18-3.6 errored, something about upgrades
# FROM postgres:18-alpine

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# Install temporal_tables extension
# see: https://pgxn.org/dist/temporal_tables/
RUN apt-get -qq update
# needed, see: https://stackoverflow.com/a/61877103/712005
RUN apt-get install postgresql-server-dev-17 -y -qq
RUN apt-get install python3-pip -y -qq
# see: https://pgxn.github.io/pgxnclient/install.html
RUN pip install pgxnclient
# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install temporal_tables


