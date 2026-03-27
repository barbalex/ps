FROM postgis/postgis:17-3.5
# FROM postgis/postgis:18-3.6 errored, something about upgrades
# FROM postgres:18-alpine

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# Install some helpful stuff
# RUN apt-get -qq update
# log less: https://askubuntu.com/a/668859
# RUN apt-get install -y -qq curl
# RUN apt-get install -y -qq bash
# RUN apt-get install -y -qq nano
# RUN apt-get install -y -qq rclone
# RUN apt-get install -y -qq dos2unix

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

# add the backup script
# ADD backup.sh /backup.sh
# Change line ending format to LF
# RUN dos2unix /backup.sh
# RUN chmod +x /backup.sh
# see: https://stackoverflow.com/a/37458519/712005
# RUN chmod 0744 /backup.sh

