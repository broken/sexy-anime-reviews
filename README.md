# sexy-anime-reviews
Simple app engine app that utilizes polymer & firebase to display my anime reviews.
Site: http://animereviews.link

Few things I wanted to play with:
* complete project developement on a Chromebook (start to finish)
* Polymer 1.0
* Firebase
* Google App Engine
* Cloud9
* bonus: Google authentication in GAE & Firebase


My notes so I don't forget...
can push to appengine via script:
  ../google-cloud-sdk/platform/google_appengine/appcfg.py --noauth_local_webserver update .
Used to be able to push with git, but no longer tracking bower_components directory.
  git push appengine
If creds expire:
  gcloud auth login
