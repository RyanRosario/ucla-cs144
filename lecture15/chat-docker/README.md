# Deploying Chat App to Google Kubernetes Engine

## Install Docker

```
sudo apt install docker.io
# Add your user to the Docker group so you can run it without `sudo`
sudo usermod -aG docker $USER
# Exit the shell and re-enter
```

## Building and Running the Docker Container

1. Write the Docker file (included)

2. Build the image:

`docker buildx build -t chat .`

3. Run the container:

`docker run -d -p 8080:1919 chat`

For this specific demo, you should be able to see the app by going to the public IP address on port 80
if you have configured Nginx as a reverse proxy to port 8080 on the server.

If the container does not run as expected, use `docker container logs <CONTAINER_HASH>` to see the logs.
You will then need to stop and delete the running container, rebuild, and run again.

```
docker container stop <CONTAINER_HASH>
docker container rm <CONTAINER_HASH>
```

You can see your running containers with `docker ps`.

Occasionally you will want to delete old Docker images.

```
docker image ls
docker rmi <IMAGE_HASH>
```

The next steps are only necessary if you want to push the image to Google Artifact Registry or Docker Hub:

4. (GCP specific) Create an artifact repository.

```
gcloud artifacts repositories create REPO_NAME \
  --repository-format=docker \
  --location=us-west1 \
  --description="A nice description"
```

Replace `us-west1` with another region if necessary.

5. (GCP specific) Add permissions to your Google Cloud user:

```
gcloud projects add-iam-policy-binding projects/PROJECT_ID \
  --member="user:YOUR_EMAIL@example.com" \
  --role="roles/artifactregistry.writer"
```
6. (GCP specific) Authenticate to GAR in the specific region:

```
gcloud auth configure-docker us-west1-docker.pkg.dev
```

7. (GCP specific) Push your image to Google Artifact Registry:

First tag it to give it a version number.

The first `chat` refers to local image, the second is remote image.

```
docker tag chat \
  us-west1-docker.pkg.dev/PROJECT_ID/REPO_NAME/chat:v1
```

Push it (cue Salt 'n Peppa):

```
docker push \
  us-west1-docker.pkg.dev/PROJECT_ID/REPO_NAME/chat:v1
```

8. (Docker hub) Docker Hub is the default:

```
docker tag chat DOCKER_USERNAME/chat
docker push DOCKER_USERNAME/chat
```

## Enable Google Kubernetes Engine

1. Enable to GKE API. You only need to do this once.

`gcloud services enable container.googleapis.com`

2. Create a GKE cluster. You only need to do this once. This can take quite a while.

```
gcloud container clusters create YOUR_CLUSTER_NAME \
    --zone YOUR_CLUSTER_ZONE \
    --machine-type e2-small \
    --num-nodes 1
```

In my case, I am going to name the cluster `cs144` and use `us-west1-a` as that is where my artifact
registry is. We will use an `e2-small` since this app does not require many resources. We will also
start with 1 node (not that this 1 node, not 1 pod).

3. Install SDK for Kubernetes. You only need to do this once

`gcloud components install kubectl` which controls the cluster

or (only do this if you get an error regarding gcloud being installed by a package manager)

```
# 1. Update APT and install pre-reqs
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
# 2. Add Google Cloud public signing key
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg
# 3. Add the Cloud SDK repo to sources
echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
  sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list > /dev/null
# 4. Update again to fetch GCP packages
sudo apt-get update
# 5. Install kubectl and the GKE auth plugin
sudo apt-get install -y kubectl google-cloud-sdk-gke-gcloud-auth-plugin
# 6. Enable the plugin in your shell
echo "export USE_GKE_GCLOUD_AUTH_PLUGIN=True" >> ~/.bashrc
source ~/.bashrc
# 7. Authenticate kubectl for your cluster
gcloud container clusters get-credentials <CLUSTER_NAME> --zone <ZONE>
```

Test with `kubectl get nodes`, you should see one node.

4. Authenticate if you didn't do it in the previous step.

```
gcloud container clusters get-credentials my-node-cluster \
    --zone us-west1-a
```

Substitute the proper zone.

5. Build and push the app image if you have not already done so.

6. Create a `deployment.yaml` that describes how to deploy the app into pods. Fill in `k8s/deployment.yaml.template`.

7. Create a `service.yaml` that describes how we will interact with the cluster. Fill in `k8s/service.yaml.template`.

8. Deploy to the cluster:

```
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

9. Monitor the GKE Workloads tab. Click on it to find the Load Balancer powering your app, and click on the IP address.

10. You can scale your deployment up and down by modifying and redeploying the `deployment.yaml` file or executing

`kubectl scale deployment <DEPLOYMENT_NAME> --replicas=<N>`

See your pods with:

`kubectl get pods`

11. When you are done:

```
kubectl delete deployment <DEPLOYMENT_NAME>
```

12. Delete your cluster to prevent being charged.

All of this can be done in the UI as well.

## Auto Scaling

To save credit on the coupon we will not use auto-scaling, though you can play with it if you are curious.

The file `hpa.yaml.conf` creates a `HorizontalPodAutoscaler` which uses certain system metrics to scale up
additional pods. In the example provided, if the **total** CPU requested across all pods in the deployment 
exceeds 70%.

The autoscaler must be deployed separately:

`kubectl apply -f hpa.yaml`


