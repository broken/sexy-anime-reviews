"""
Crunchyroll API client helper for fetching official anime metadata and high-resolution covers.
"""

import json
import re
import time
import urllib.parse
import urllib.request

CR_BASIC_AUTH = 'dGd6ZXI0aXV3Z3Bha3ljaWs4OHc6emV5Ul9Ud21EWHJYMmpZZVY3RWd0akJSOTZPdEl4QW8='
_cr_token_cache = {'token': None, 'expires_at': 0}


def get_cr_token():
  """Retrieves and caches an anonymous OAuth access token for Crunchyroll API."""
  now = time.time()
  if _cr_token_cache['token'] and now < _cr_token_cache['expires_at']:
    return _cr_token_cache['token']

  data = urllib.parse.urlencode({'grant_type': 'client_id'}).encode('utf-8')
  req = urllib.request.Request(
      'https://beta-api.crunchyroll.com/auth/v1/token',
      data=data,
      headers={
          'Authorization': f'Basic {CR_BASIC_AUTH}',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Crunchyroll/3.122.0 Android/14'
      }
  )
  with urllib.request.urlopen(req, timeout=10) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    token = res['access_token']
    expires_in = res.get('expires_in', 3600)
    _cr_token_cache['token'] = token
    _cr_token_cache['expires_at'] = now + expires_in - 60
    return token


def pick_best_poster(images_dict):
  """Finds the highest quality vertical poster with the official title logo."""
  posters = images_dict.get('poster_tall', [])
  if not posters:
    return ''

  flat = []
  for item in posters:
    if isinstance(item, list):
      flat.extend(item)
    elif isinstance(item, dict):
      flat.append(item)

  if not flat:
    return ''

  flat.sort(key=lambda x: x.get('width', 0), reverse=True)
  # Prefer ~1200x1800 if available, otherwise the highest resolution
  for p in flat:
    if p.get('width') == 1200:
      return p.get('source')
  return flat[0].get('source')


def pick_thumbnail_poster(images_dict, target_width=480):
  """Finds a thumbnail vertical poster suitable for card previews."""
  posters = images_dict.get('poster_tall', [])
  if not posters:
    return ''

  flat = []
  for item in posters:
    if isinstance(item, list):
      flat.extend(item)
    elif isinstance(item, dict):
      flat.append(item)

  if not flat:
    return ''

  return min(flat, key=lambda x: abs(x.get('width', 0) - target_width)).get('source', '')


def get_series_by_id(series_id, token):
  """Retrieves detailed series information including categories and Dub/Sub availability."""
  url = f'https://beta-api.crunchyroll.com/content/v2/cms/objects/{series_id}'
  req = urllib.request.Request(
      url,
      headers={
          'Authorization': f'Bearer {token}',
          'User-Agent': 'Crunchyroll/3.122.0 Android/14'
      }
  )
  try:
    with urllib.request.urlopen(req, timeout=10) as resp:
      data = json.loads(resp.read().decode('utf-8'))
      items = data.get('data', [])
      if items:
        item = items[0]
        meta = item.get('series_metadata') or {}
        genres = meta.get('tenant_categories') or item.get('keywords') or []
        cover = pick_best_poster(item.get('images', {}))
        thumbnail = pick_thumbnail_poster(item.get('images', {}))
        show_type = 'movie' if item.get('type') == 'movie_listing' else 'series'
        is_dubbed = meta.get('is_dubbed', False)
        view_method = 'dub' if is_dubbed else 'sub'
        return {
            'id': item.get('id'),
            'title': item.get('title'),
            'showType': show_type,
            'genres': genres,
            'coverUrl': cover,
            'thumbnailUrl': thumbnail,
            'format': item.get('type'),
            'viewMethod': view_method
        }
  except Exception as e:
    print(f'Error fetching series object {series_id}: {e}')
  return None


def search_crunchyroll(query):
  """Searches Crunchyroll for an anime or fetches metadata from a Crunchyroll URL."""
  query = query.strip()
  if not query:
    return []

  try:
    token = get_cr_token()

    # Check if a Crunchyroll URL with series ID is provided
    m = re.search(r'/series/([A-Z0-9]+)', query)
    if m:
      series_id = m.group(1)
      res = get_series_by_id(series_id, token)
      if res:
        return [res]

    search_term = query
    if 'crunchyroll.com' in query:
      parts = [p for p in urllib.parse.urlparse(query).path.split('/') if p]
      if parts:
        search_term = parts[-1].replace('-', ' ')

    search_url = f'https://beta-api.crunchyroll.com/content/v2/discover/search?q={urllib.parse.quote(search_term)}&type=series,movie_listing&n=6'
    req = urllib.request.Request(
        search_url,
        headers={
            'Authorization': f'Bearer {token}',
            'User-Agent': 'Crunchyroll/3.122.0 Android/14'
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
      data = json.loads(resp.read().decode('utf-8'))
      results = []
      for group in data.get('data', []):
        for item in group.get('items', []):
          series_id = item.get('id')
          title = item.get('title')
          cover = pick_best_poster(item.get('images', {}))
          thumbnail = pick_thumbnail_poster(item.get('images', {}))
          show_type = 'movie' if item.get('type') == 'movie_listing' else 'series'
          results.append({
              'id': series_id,
              'title': title,
              'showType': show_type,
              'coverUrl': cover,
              'thumbnailUrl': thumbnail,
              'format': item.get('type'),
          })

      enriched = []
      for r in results[:5]:
        details = get_series_by_id(r['id'], token)
        if details:
          r['genres'] = details.get('genres', [])
          r['viewMethod'] = details.get('viewMethod', 'sub')
          if details.get('coverUrl'):
            r['coverUrl'] = details['coverUrl']
          if details.get('thumbnailUrl'):
            r['thumbnailUrl'] = details['thumbnailUrl']
        else:
          r['genres'] = []
          r['viewMethod'] = 'sub'
        enriched.append(r)
      return enriched

  except Exception as e:
    print(f'Crunchyroll API failed: {e}')
    return []
