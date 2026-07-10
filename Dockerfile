# GIAI ĐOẠN 1: BUILD ỨNG DỤNG

from node:18-alpine as Builder
WORKDIR /app
COPY package*.json ./
run npm install
copy . .
run npm run build

#GIAI ĐOẠN 2: CHẠY ỨNG DỤNG

FROM nginx:alpine
run rm -rf /usr/share/nginx/html/*

COPY --from=Builder /app/build /usr/share/nginx/html
EXPOSE 8080
CMD [ "nginx","-g", "daemon off;" ]
