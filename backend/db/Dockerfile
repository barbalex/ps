# JOBMON and PARTMAN inspired by: https://github.com/dbsystel/postgresql-partman-container/blob/main/Dockerfile
ARG JOBMON_VERSION="v1.4.1"
ARG PARTMAN_VERSION="v5.4.3"

FROM postgis/postgis:18-3.6 AS builder

ARG JOBMON_VERSION
ARG PARTMAN_VERSION

RUN apt-get -qq update \
  && apt-get install -y -qq --no-install-recommends \
  postgresql-server-dev-18 \
  pgxnclient \
  build-essential \
  wget \
  && rm -rf /var/lib/apt/lists/*

# see: https://pgxn.org/dist/temporal_tables/
RUN pgxn install temporal_tables

RUN wget -q "https://github.com/omniti-labs/pg_jobmon/archive/refs/tags/${JOBMON_VERSION}.tar.gz" \
  && tar zxf "${JOBMON_VERSION}.tar.gz" \
  && cd "pg_jobmon-${JOBMON_VERSION#v}" \
  && make \
  && make install \
  && cd / \
  && rm -rf "${JOBMON_VERSION}.tar.gz" "pg_jobmon-${JOBMON_VERSION#v}"

RUN wget -q "https://github.com/pgpartman/pg_partman/archive/refs/tags/${PARTMAN_VERSION}.tar.gz" \
  && tar zxf "${PARTMAN_VERSION}.tar.gz" \
  && cd "pg_partman-${PARTMAN_VERSION#v}" \
  && make \
  && make install \
  && cd / \
  && rm -rf "${PARTMAN_VERSION}.tar.gz" "pg_partman-${PARTMAN_VERSION#v}"

FROM postgis/postgis:18-3.6

# mount SQL files directly into the Postgres containers’ initialization directory
COPY ./init/ /docker-entrypoint-initdb.d/

COPY --from=builder /usr/lib/postgresql/18/lib/ /usr/lib/postgresql/18/lib/
COPY --from=builder /usr/share/postgresql/18/extension/ /usr/share/postgresql/18/extension/


