# declare the base image
FROM nginx:alpine

# set a work directory
WORKDIR /usr/share/nginx/html

# copy the static files
COPY ./dist .
# Provide a custom nginx.conf, enabling reloading on sub paths
COPY nginx.conf /data/conf/

# expose nginx port
EXPOSE 80

# start nginx server
CMD ["nginx", "-g", "daemon off;", "-c", "/data/conf/nginx.conf"]

# docker build -t staticps .
# docker run --name staticps -p808:80 -d staticps
# 127.0.0.1:808
