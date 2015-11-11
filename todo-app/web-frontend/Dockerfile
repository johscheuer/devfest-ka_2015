FROM alpine:3.2

ADD ./bin/todo-app /app/todo-app
ADD ./public/index.html /app/public/index.html
ADD ./public/script.js /app/public/script.js

WORKDIR /app
CMD ["./todo-app"]
EXPOSE 3000
