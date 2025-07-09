# declare the base image
FROM nginx:alpine

# set a work directory
WORKDIR /usr/share/nginx/html

# copy the static files
COPY dist/. frontend/.

# expose nginx port
EXPOSE 80

# start nginx server
CMD ["nginx", "-g", "daemon off;"]

# docker build -t staticps .
# docker run -p808:80 -d staticps

# 127.0.0.1:808