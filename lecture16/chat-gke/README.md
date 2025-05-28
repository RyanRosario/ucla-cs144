# Deploying Chat App to Google Kubernetes Engine with HTTPS

## Deploying to Google Kubernetes Engine

1. Follow the directions from Lecture 15 README.

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

`us-west1` is heavily constrained. You can also use `us-central1` or `us-east1`. If you do this, you
should create your artifact registry in that same region. If you do not, you will be charged for egress
when pulling the Docker image, but this is a very minimal charge (1 cent per GB).

3. Create and apply both the `deployment.yaml` and `service.yaml` files, similar to Lecture 15.

```
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

If either of these commands fail with a network communication error, you may need to reauthenticate:

`gcloud container clusters get-credentials <CLUSTER_NAME> --zone <ZONE> --project <PROJECT_ID>`

4. Create the managed certificate by creating `certificate.yaml` and then apply:

`kubectl apply -f certificate.yaml`

You **will need** a domain name for this.

This can take quite a while (15 minutes to 2 hours). Execute the following command to see progress:

`kubectl describe managedcertificate your-appname-certificate`

You want to see something like the following:

```
Name:         chat-app-certificate
Namespace:    default
Labels:       <none>
Annotations:  <none>
API Version:  networking.gke.io/v1
Kind:         ManagedCertificate
Metadata:
  Creation Timestamp:  2025-05-28T19:05:49Z
  Generation:          5
  Resource Version:    1748462410937231006
  UID:                 ...
Spec:
  Domains:
    gke-demo.cs144.org
Status:
  Certificate Name:    mcrt-...
  Certificate Status:  Active
  Domain Status:
    Domain:     gke-demo.cs144.org
    Status:     Active
  Expire Time:  2025-08-26T12:44:36.000-07:00
Events:
  Type    Reason  Age   From                            Message
  ----    ------  ----  ----                            -------
  Normal  Create  55m   managed-certificate-controller  Create SslCertificate mcrt-,,,
```

5. Once the certificate is active, create the ingress, which is the gateway into the GKE cluster in `ingress.yaml` and configure with

`kubectl apply -f ingress.yaml`

Note that in the template I provide, one line is commented out. You must uncomment this line.

6. Create the front end configuration which forces an upgrade from HTTP to HTTPS. Note that the path section
looks similar to a route. That is not a coincidence.

`kubectl apply -f frontendconfig.yaml`

7. Go to your domain. You should see your site without any security warnings.
