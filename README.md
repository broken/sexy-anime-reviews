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


## 2020 Update
Wow; the last time I deployed this was Jan 2017. I've been able to update reviews and serve them flawlessly since. (I am only dusting it off now to fix a minor bug when the title includes a slash.) A lot has changed though. Amazon bought Cloud9, Google bought Firebase, and Web Components / Polymer are quite different from what they were. My AWS account was suspended for some reason, and who knows if this project exists in AWS Cloud9 anymore, but it's great to see the Google / Firebase transition was smooth. Also, Google Cloud's App Engine looks much nicer (I would hope after all these years), and includes automatic versioning and canarying. Plus, deployment was simpler (`gcloud app deploy`). I'm still happy with the performance and design, so I don't plan on updating this off of Polymer 1.0 - just know that this code should not be used as an example anymore.

Here's hoping another many years pass without any need to look at this code. :D

## 2023 Update
Added showType to distinguish between movies and series. Make sure to specify project `gcloud app deploy --project=sexy-anime-reviews` when deploying to prevent blowing away a different site. Oh, and the 'sexy' refers to the website design.
