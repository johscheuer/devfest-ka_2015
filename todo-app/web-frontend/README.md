# Complie the go

```
go get github.com/codegangsta/negroni
go get github.com/gorilla/mux
go get github.com/xyproto/simpleredis
# On OSX
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/todo-app .
# Create the Docker image
docker build -t johscheuer/todo-app-web .
# Tag the image
docker tag -f johscheuer/todo-app-web johscheuer/todo-app-web:k8s_v2
```
