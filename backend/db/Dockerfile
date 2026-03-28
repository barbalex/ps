# JOBMON and PARTMAN inspired by: https://github.com/dbsystel/postgresql-partman-container/blob/main/Dockerfile
ARG TEMPORAL_TABLES_VERSION="1.2.2"
ARG JOBMON_VERSION="v1.4.1"
ARG JOBMON_SHA256="1dcd190107dded06a53703c2034f8e79d5f9d20e6338edfb4593a8e9a01c2c49"
ARG PARTMAN_VERSION="v5.4.3"
ARG PARTMAN_SHA256="c52e3b8cf80d306468f48fbdb1905e4c2574bf8362240af57aebbbf9e18c6fe2"

FROM postgis/postgis:18-3.6 AS builder

ARG TEMPORAL_TABLES_VERSION
ARG JOBMON_VERSION
ARG JOBMON_SHA256
ARG PARTMAN_VERSION
ARG PARTMAN_SHA256

RUN apt-get -qq update \
  && apt-get install -y -qq --no-install-recommends \
  postgresql-server-dev-18 \
  pgxnclient \
  build-essential \
  wget \
  && rm -rf /var/lib/apt/lists/*

# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install "temporal_tables=${TEMPORAL_TABLES_VERSION}"

RUN wget -q -O pg_jobmon.tar.gz "https://github.com/omniti-labs/pg_jobmon/archive/refs/tags/${JOBMON_VERSION}.tar.gz" \
  && echo "${JOBMON_SHA256}  pg_jobmon.tar.gz" | sha256sum -c - \
  && tar zxf pg_jobmon.tar.gz \
  && cd "pg_jobmon-${JOBMON_VERSION#v}" \
  && make \
  && make install \
  && cd / \
  && rm -rf pg_jobmon.tar.gz "pg_jobmon-${JOBMON_VERSION#v}"

RUN wget -q -O pg_partman.tar.gz "https://github.com/pgpartman/pg_partman/archive/refs/tags/${PARTMAN_VERSION}.tar.gz" \
  && echo "${PARTMAN_SHA256}  pg_partman.tar.gz" | sha256sum -c - \
  && tar zxf pg_partman.tar.gz \
  && cd "pg_partman-${PARTMAN_VERSION#v}" \
  && make \
  && make install \
  && cd / \
  && rm -rf pg_partman.tar.gz "pg_partman-${PARTMAN_VERSION#v}"

FROM postgis/postgis:18-3.6

# ensure pgxnclient is available in the final build
RUN apt-get -qq update \
  && apt-get install -y -qq --no-install-recommends \
  pgxnclient \
  && rm -rf /var/lib/apt/lists/*

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

COPY --from=builder /usr/lib/postgresql/18/lib/ /usr/lib/postgresql/18/lib/
COPY --from=builder /usr/share/postgresql/18/extension/ /usr/share/postgresql/18/extension/


