#!/bin/bash

sudo apt install docker.io
mkdir -p ~/.docker/cli-plugins

# Download buildx (replace with your CPU architecture and desired version)
curl -L "https://github.com/docker/buildx/releases/download/v0.12.1/buildx-v0.12.1.linux-amd64" -o ~/.docker/cli-plugins/docker-buildx

# Make it executable
chmod +x ~/.docker/cli-plugins/docker-buildx

sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

# then restart the shell
