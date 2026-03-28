# JOBMON and PARTMAN inspired by: https://github.com/dbsystel/postgresql-partman-container/blob/main/Dockerfile
ARG JOBMON_VERSION="v1.4.1"
ARG PARTMAN_VERSION="v5.4.3"

FROM postgis/postgis:18-3.6

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# TODO: which do we not need because we removed checksums?
RUN apt-get -qq update && apt-get install -y -qq \
  postgresql-server-dev-18 \
  pgxnclient \
  build-essential \
  wget \
  make \
  $DOCKER_PG_LLVM_DEPS && rm -rf /var/lib/apt/lists/*

# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install temporal_tables

# now jobmon and partman
# TODO: check for newer versions
ARG JOBMON_VERSION
ARG PARTMAN_VERSION

RUN wget "https://github.com/omniti-labs/pg_jobmon/archive/refs/tags/${JOBMON_VERSION}.tar.gz" \
  && tar zxf ${JOBMON_VERSION}.tar.gz && cd pg_jobmon-${JOBMON_VERSION#v}\
  && make \
  && make install

RUN wget "https://github.com/pgpartman/pg_partman/archive/refs/tags/${PARTMAN_VERSION}.tar.gz" \
  && tar zxf ${PARTMAN_VERSION}.tar.gz && cd pg_partman-${PARTMAN_VERSION#v}\
  && make \
  && make install


