#!/usr/bin/env python3
"""
CLI helper to fetch anime metadata and high-resolution posters from TMDb.
Usage:
    python3 tmdb_fetch.py "Cyberpunk: Edgerunners"
    python3 tmdb_fetch.py "https://www.themoviedb.org/tv/105248-cyberpunk-edgerunners"
"""

import json
import sys
from tmdb import search_tmdb


def main():
  if len(sys.argv) < 2:
    print('Usage: python3 tmdb_fetch.py "<anime title or themoviedb.org URL>"')
    sys.exit(1)

  query = ' '.join(sys.argv[1:])
  print(f'Searching TMDb for: "{query}"...\n')

  results = search_tmdb(query)
  if not results:
    print('No results found on TMDb.')
    sys.exit(0)

  print(f'Found {len(results)} result(s):\n')
  for i, r in enumerate(results, start=1):
    print(f'--- Result #{i} ---')
    print(f'Title:         {r.get("title")}')
    print(f'Romaji Title:  {r.get("romajiTitle")}')
    print(f'Show Type:     {r.get("showType")} ({r.get("format")})')
    print(f'Genres:        {", ".join(r.get("genres", []))}')
    print(f'View Method:   {r.get("viewMethod")}')
    print(f'Cover URL:     {r.get("coverUrl")}')
    print(f'Thumbnail URL: {r.get("thumbnailUrl")}')
    print(f'Source:        {r.get("source")}')
    print()

  print('JSON output of first result:')
  print(json.dumps(results[0], indent=2))


if __name__ == '__main__':
  main()
