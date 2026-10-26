# sexy-anime-reviews
Simple app engine app that utilizes polymer (edit: no longer) & firebase to display my anime reviews.
Site: http://animereviews.link

I just wanted to make a sexy looking site with a few technologies I had been itching to play with:
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

## 2026 Update
I wanted to add a few things to make adding entries into the site easier. While everything was running correctly and fine still, it was on obsolete/deprecated components - polymer, link imports, etc. Thus I decided to update to something more modern - namely lit since it is so slim, making it easy to convert later if necessary, and I'm familiar with it. Anyway, changes I made were: migration off of polymer & bower to lit element & npm, pulling metadata from Crunchyroll when adding reviews, script for identifying orphaned images, mobile view, support thumbnails, support spoilers, and dark mode. Here's to hoping for another many years of hands-off operation.

## How to use

To run locally: `.venv/bin/python3 main.py`
To deploy: `gcloud app deploy --project=sexy-anime-reviews`
Ratings histogram: `python3 rating_histogram.py`

### Pages

* '/' : list of all reviews
* '/add' : form to add a new review
* '/login' : login page for google accounts
* '/[ID]' : page for a specific review
* '/edit/[ID]' : edit a specific review
