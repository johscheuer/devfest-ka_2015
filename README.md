# Intro

# Running an application on GKE
## Setup a GKE Cluster

```Bash
# Create account.. Fetch gcloud SDK
gcloud components update kubectl

# Set your project
gcloud config set project PROJECT

# Select a Zone e.q. gcloud compute zones list
gcloud config set compute/zone ZONE

# Falls schon ein Cluster erstellt wurde:
gcloud config set container/cluster CLUSTER_NAME gcloud container clusters get-credentials CLUSTER_NAME

# Oder jetzt ein cluster erstellen :)
gcloud container clusters create my-cluster \
--num-nodes 3 \     
--machine-type g1-small

# Und zum Abschluss das Ganze nocheinmal prüfen
gcloud config list kubectl get nodes #liefert alle nodes
```

## List all services and Pods

```Bash
kubectl get --all-namespaces services
...
kubectl get --all-namespaces pods
```

# Examples
## First example
### With golang

```Bash
export PROJECT_ID="xxx-xxx-xxx"
go get github.com/johscheuer/go-hello-webserver
cd $GOPATH/src/github.com/johscheuer/go-hello-webserver
GOOS=linux CGO_ENABLED=0 go build -a -x -o hello-webserver
```

### Complete with docker

```Bash
export PROJECT_ID="xxx-xxx-xxx"
docker-machine create --driver virtualbox default
eval "$(docker-machine env default)"

git clone Https://github.com/johscheuer/go-hello-webserver.git
cd go-hello-webserver

docker run --rm -v "$PWD":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e CGO_ENABLED=0 golang:1.5.0-cross go build -v -a -x -o hello-webserver
```

### Build an container image for GKE
#### On Mac

```Bash
docker-machine create --driver virtualbox default eval "$(docker-machine env default)"

# Build the image
docker build -t gcr.io/${PROJECT_ID}/hello-webserver .

# Push the image to the registry
gcloud docker push gcr.io/${PROJECT_ID}/hello-webserver

# Registry is not secured everybody who has the project ID and knows the container name can access the images
```

### Run your application on the GKE cluster

```Bash
# Run the image from commandline
kubectl run hello-webserver --image=gcr.io/${PROJECT_ID}/hello-webserver --port=8000

# Validate
kubectl get pods kubectl get rc kubectl describe rc hello-webserver kubectl describe pods hello-webserver

# Make the pod(s) accessable
kubectl expose rc hello-webserver --create-external-load-balancer=true kubectl get services

# Tmux -> watch the external loadbalancer
# then scale the application
# Website was so successful we need to scale up!
kubectl scale rc hello-webserver --replicas=3

# remove everything
kubectl delete services hello-webserver kubectl stop rc hello-webserver
```

## Useful commandos

```Bash
# List all compute instances
gcloud compute instances list
# List all kube-system services
kubectl get services --namespace=kube-system
```
