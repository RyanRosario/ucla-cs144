# Deploying Chat App to Google App Engine

## Enable Google App Engine

```
gcloud services enable appengine.googleapis.com
gcloud app create --project=<PROJECT_ID>
```

## Deploy

`gcloud app deploy --version 1`

By default, each time you deploy, a new version of your app is created.

The reason for this is that you do not want to interrupt users that are
currently using your app. Instead, you want to *migrate* users to the
new version as they request the app. Naturally users will evolve to
use the new version. 

The problem with this is that you have multiple versions hanging around,
some of which Google Cloud will automatically create instances for. This
means you are being billed for versions that have no traffic. By
using `--version 1` we overwrite version 1 with the new version and
do not need to worry about this. This does mean that user sessions
may break.

## Disabling

When you are done testing, disable your app so you are not charged.

Go here and click the Disable Application button:

https://console.cloud.google.com/appengine/settings`

# Nginx Deployment Demo

1. Move this file to `/etc/nginx/sites-available/chat.conf`
2. Activate the site `sudo ln -s /etc/nginx/sites-available/chat.conf /etc/nginx/sites-enabled/chat.conf`
3. Restart NGINX `sudo systemctl restart nginx`
4. Start the Node server if appropriate.
5. Visit the domain, standard port
