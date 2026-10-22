#!/usr/bin/env python3
"""
cr_fetch.py - Crunchyroll Anime Metadata & Official Cover Downloader

Fetches official anime details (Title, Genres, Show Type, Audio, and High-Res Cover with Title Logo)
directly from Crunchyroll given an anime title or Crunchyroll URL.

Usage:
  python3 cr_fetch.py "Chainsaw Man"
  python3 cr_fetch.py "https://www.crunchyroll.com/series/GVDHX8QNW/chainsaw-man"
"""

import sys
import os
import re
import urllib.request
from crunchyroll import search_crunchyroll

def fetch_anime(query, download_cover=True, output_dir="."):
    query = query.strip()
    if not query:
        print("Please provide an anime title or Crunchyroll URL.")
        return None

    results = search_crunchyroll(query)
    if not results:
        print(f"No results found on Crunchyroll for: {query}")
        return None

    match = results[0]
    title = match.get('title', '')
    show_type = match.get('showType', 'series').capitalize()
    genres = match.get('genres', [])
    view_method = match.get('viewMethod', 'sub').upper()
    cover_url = match.get('coverUrl', '')

    print("\n" + "=" * 52)
    print("  CRUNCHYROLL ANIME DETAILS")
    print("=" * 52)
    print(f"  Title:      {title}")
    print(f"  Show Type:  {show_type}")
    print(f"  Audio:      {view_method}")
    print(f"  Genres:     {', '.join(genres) if genres else 'N/A'}")
    print(f"  Cover URL:  {cover_url}")
    print("=" * 52)

    if download_cover and cover_url:
        clean_title = re.sub(r'[^a-zA-Z0-9]', '', title) or 'cover'
        ext = 'png' if '.png' in cover_url else 'jpg'
        filename = os.path.join(output_dir, f"{clean_title}.{ext}")
        print(f"\nDownloading official cover to: {filename} ...")
        img_req = urllib.request.Request(cover_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(img_req, timeout=15) as img_resp:
            with open(filename, 'wb') as f:
                f.write(img_resp.read())
        print(f"✓ Official cover saved: {filename}\n")

    return match

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 cr_fetch.py <Anime Title or Crunchyroll URL>")
        sys.exit(1)
    fetch_anime(" ".join(sys.argv[1:]))
