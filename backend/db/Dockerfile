# JOBMON and PARTMAN inspired by: https://github.com/dbsystel/postgresql-partman-container/blob/main/Dockerfile
ARG JOBMON_VERSION="v1.4.1"
ARG PARTMAN_VERSION="v5.2.4"

FROM postgis/postgis:18-3.6

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

# Install temporal_tables extension
# see: https://pgxn.org/dist/temporal_tables/
RUN apt-get -qq update
# needed for building pgxnclient, see: https://stackoverflow.com/a/61877103/712005
RUN apt-get install -y -qq \
  postgresql-server-dev-18 \
  pgxnclient \
  build-essential \
  git \
  wget \
  gcc \
  make \
  musl-dev \
  $DOCKER_PG_LLVM_DEPS && rm -rf /var/lib/apt/lists/*

# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install temporal_tables

# now jobmon and partman
# TODO: check for newer versions
ARG JOBMON_VERSION
ARG PARTMAN_VERSION
ARG JOBMON_CHECKSUM="db67c068ecdc136305eafb25bd8fc737f6b9944d4ef3d59ecf7006933686e272995b1733f1fa1a72bd932443669b26e25647701190d92419226b774707d8cc44"
ARG PARTMAN_CHECKSUM="8328a00ce1a55a5c9173d4adbf251e784fed62413fb76bba89dd893749a720a5ecb25ee668eb0b826b8e1f2b89d9dd7da219fd797bfd9ab1a43d05f5b3ac494f"

RUN wget "https://github.com/omniti-labs/pg_jobmon/archive/refs/tags/${JOBMON_VERSION}.tar.gz" \
  && echo "${JOBMON_CHECKSUM}  ${JOBMON_VERSION}.tar.gz" | sha512sum -c \
  && tar zxf ${JOBMON_VERSION}.tar.gz && cd pg_jobmon-${JOBMON_VERSION#v}\
  && make \
  && make install

RUN wget "https://github.com/pgpartman/pg_partman/archive/refs/tags/${PARTMAN_VERSION}.tar.gz" \
  && echo "${PARTMAN_CHECKSUM}  ${PARTMAN_VERSION}.tar.gz" | sha512sum -c \
  && tar zxf ${PARTMAN_VERSION}.tar.gz && cd pg_partman-${PARTMAN_VERSION#v}\
  && make \
  && make install


