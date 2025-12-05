FROM postgis/postgis:17-3.5

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# Install some helpful stuff
RUN apt-get -qq update
# log less: https://askubuntu.com/a/668859
# RUN apt-get install -y -qq curl
RUN apt-get install -y -qq bash
RUN apt-get install -y -qq nano
# RUN apt-get install -y -qq rclone
# RUN apt-get install -y -qq dos2unix

# add the backup script
# ADD backup.sh /backup.sh
# Change line ending format to LF
# RUN dos2unix /backup.sh
# RUN chmod +x /backup.sh
# see: https://stackoverflow.com/a/37458519/712005
# RUN chmod 0744 /backup.sh

