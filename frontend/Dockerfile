# declare the base image
FROM nginx:alpine

# set a work directory
WORKDIR /usr/share/nginx/html

# copy the static files
COPY ./dist .

# expose nginx port
EXPOSE 80

# start nginx server
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]

# docker build -t staticps .
# docker run --name staticps -p808:80 -d staticps
# 127.0.0.1:808

# add these lines to /etc/nginx/nginx.conf:
# location / {
#     try_files $uri $uri/ @application;
# }

# location @application {
#     proxy_pass http://127.0.0.1:808;
# }
