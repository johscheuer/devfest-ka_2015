# Introduction to the Google Container Engine
## Setup a GKE Cluster

```Bash
https://cloud.google.com/sdk/#Quick_Start
# Create account.. Fetch gcloud SDK
gcloud components update kubectl

# Set your project
gcloud config set project PROJECT

# Select a Zone e.q. gcloud compute zones list
gcloud config set compute/zone europe-west1-d

# Create the cluster called "devfest-ka15" (takes some time)
gcloud container clusters create devfest-ka15 \
--num-nodes 3 \
--machine-type n1-standard-1 \
--password mYs3cred \
--username devfest-ka15

# Check the created instances
gcloud compute instances list

# Now we set the cluster:
gcloud config set container/cluster devfest-ka15
gcloud container clusters get-credentials devfest-ka15
```

## List all services and Pods

```Bash
# Get all Services
kubectl get --all-namespaces services
# Get all Pods
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

### Build an container image for GKE
#### On Mac

```Bash
# Only if you don't have a default VM
docker-machine create --driver virtualbox default
# Set env variables
eval "$(docker-machine env default)"

# Build the image
docker build -t gcr.io/${PROJECT_ID}/hello-webserver .

# Push the image to the registry
gcloud docker push gcr.io/${PROJECT_ID}/hello-webserver

# Registry is not secured
# everybody who has the project ID
# and knows the container name can access the images
```

### Run your application on the GKE cluster

```Bash
# Run the image from commandline
kubectl run hello-webserver --image=gcr.io/${PROJECT_ID}/hello-webserver --port=8000

# See the if the pod is running
kubectl get pods
# Check the Replication Controller
kubectl get rc
# Get more details about the Replication Controller
kubectl describe rc hello-webserver
# Get more details about the Pod(s)
kubectl describe pods hello-webserver

# Make the pod(s) accessable
kubectl expose rc hello-webserver --create-external-load-balancer=true
# Fetch the public IP address
kubectl get services

# Tmux -> watch the external loadbalancer
# then scale the application
# Website was so successful we need to scale up!
kubectl scale rc hello-webserver --replicas=3

# remove everything
kubectl delete services hello-webserver
kubectl stop rc hello-webserver
```

## Todo Web App
### Running the application

```Bash
# Create a new name space
kubectl create -f ./todo-app/web-app-namespace.yml
# Show all namespaces
kubectl get namespaces
# Set the new context to use the namespace
export CONTEXT=$(kubectl config view | grep current-context | awk '{print $2}')
kubectl config set-context $CONTEXT --namespace=todo-app
# Start the Redis Master Replication Controller
kubectl create -f ./todo-app/redis-master-controller.yml
# Start the Redis Master service
kubectl create -f ./todo-app/redis-master-service.yml
# Check if the Redis Master is already created
kubectl get pods
# Start the Redis Slave Replication Controller
kubectl create -f ./todo-app/redis-slave-controller.yml
# Start the Redis Slave service
kubectl create -f ./todo-app/redis-slave-service.yml
# Check if the Redis Slave is already created
kubectl get pods
# Start the Redis Slave Replication Controller
kubectl create -f ./todo-app/todo-app-web-controller.yml
# Start the Redis Slave service
kubectl create -f ./todo-app/todo-app-web-service.yml
# Check if the Todo App is already created
kubectl get pods -l name=todo-app-web
# Validate everything
kubectl get svc
kubectl get rc
kubectl get endpoints

# Show logs from the Redis Master
kubectl logs -f {pod id}

# Make a rolling update without downtime
kubectl rolling-update todo-app-web --image=johscheuer/todo-app-web:k8s_v2 --update-period="30s"
```

## Cleanup

```Bash
# Stop all services
kubectl delete -f ./todo-app
# Default services
kubectl delete --namespace="default" services hello-webserver
kubectl stop --namespace="default" rc hello-webserver
# Destroy the cluster
gcloud container clusters delete devfest-ka15
```
