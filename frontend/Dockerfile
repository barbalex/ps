# declare the base image
FROM nginx:alpine

# set a work directory
WORKDIR /usr/share/nginx/html

# copy the static files
COPY ./dist .
# Provide a custom nginx.conf, enabling proxying to node app
COPY nginx_default.conf /etc/nginx/conf.d/default.conf

# expose nginx port
EXPOSE 80

# start nginx server
CMD ["nginx", "-g", "daemon off;"]

# npm run build
# cd frontend
# docker build -t staticps .
# docker run --name staticps -p808:80 -d staticps
# 127.0.0.1:808, ps.barbalex.ch
