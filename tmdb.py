"""
TMDb (The Movie Database) API client helper for fetching official anime metadata,
high-resolution English-logo posters, and show details.
"""

import json
import os
import re
import urllib.parse
import urllib.request


def load_env():
  """Loads environment variables from .env file if not already set."""
  env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
  if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
      for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
          k, v = line.split('=', 1)
          os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def get_tmdb_auth():
  """Retrieves the TMDb read token or API key from the environment."""
  load_env()
  read_token = os.environ.get('TMDB_READ_TOKEN')
  api_key = os.environ.get('TMDB_API_KEY')
  return read_token, api_key


def tmdb_request(endpoint, params=None):
  """Makes an authenticated GET request to the TMDb v3 API."""
  read_token, api_key = get_tmdb_auth()
  if not read_token and not api_key:
    raise ValueError('No TMDb credentials found. Set TMDB_READ_TOKEN or TMDB_API_KEY in .env')

  if params is None:
    params = {}

  headers = {
      'User-Agent': 'MyAnimeReviews/1.0',
      'Accept': 'application/json'
  }

  if read_token:
    headers['Authorization'] = f'Bearer {read_token}'
  elif api_key:
    params['api_key'] = api_key

  query_string = urllib.parse.urlencode(params)
  url = f'https://api.themoviedb.org/3/{endpoint}'
  if query_string:
    url += f'?{query_string}'

  req = urllib.request.Request(url, headers=headers)
  with urllib.request.urlopen(req, timeout=10) as resp:
    return json.loads(resp.read().decode('utf-8'))


def get_best_poster_path(media_type, media_id, default_poster_path=None):
  """Fetches the posters for a show or movie and picks the highest-voted English poster."""
  try:
    data = tmdb_request(f'{media_type}/{media_id}/images', {'include_image_language': 'en,ja,null'})
    posters = data.get('posters', [])
    if not posters:
      return default_poster_path

    # First priority: English posters (these almost always feature the official English logo)
    en_posters = [p for p in posters if p.get('iso_639_1') == 'en']
    if en_posters:
      en_posters.sort(
          key=lambda x: (x.get('vote_average', 0), x.get('vote_count', 0), x.get('width', 0)),
          reverse=True
      )
      return en_posters[0].get('file_path') or default_poster_path

    # Second priority: Any poster sorted by vote and resolution
    posters.sort(
        key=lambda x: (x.get('vote_average', 0), x.get('vote_count', 0), x.get('width', 0)),
        reverse=True
    )
    return posters[0].get('file_path') or default_poster_path
  except Exception as e:
    print(f'Error fetching TMDb images for {media_type}/{media_id}: {e}')
    return default_poster_path


def fetch_anilist_details(title_query, orig_title=None, media_type=None):
  """Queries AniList GraphQL API for canonical romaji title and anime genres."""
  format_filter = ''
  if media_type == 'movie':
    format_filter = ', format_in: [MOVIE]'
  elif media_type == 'tv':
    format_filter = ', format_in: [TV, TV_SHORT, ONA, OVA]'

  queries = []
  if orig_title and orig_title != title_query:
    queries.append(orig_title)
  if title_query:
    queries.append(title_query)

  for q in queries:
    try:
      graphql = '''{
        Page(page: 1, perPage: 1) {
          media(search: %s, type: ANIME%s) {
            title {
              romaji
              english
            }
            genres
            format
          }
        }
      }''' % (json.dumps(q), format_filter)

      req = urllib.request.Request(
          'https://graphql.anilist.co',
          data=json.dumps({'query': graphql}).encode('utf-8'),
          headers={
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0'
          }
      )
      with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        media_list = data.get('data', {}).get('Page', {}).get('media', [])
        if media_list:
          m = media_list[0]
          return {
              'romajiTitle': m.get('title', {}).get('romaji') or '',
              'englishTitle': m.get('title', {}).get('english') or '',
              'genres': m.get('genres') or [],
              'format': m.get('format') or ''
          }
    except Exception as e:
      print(f'AniList lookup error for "{q}": {e}')

  return None


def map_tmdb_genres(genres_list):
  """Normalizes TMDb genre names into standard anime genres."""
  genre_map = {
      'Action & Adventure': ['Action', 'Adventure'],
      'Sci-Fi & Fantasy': ['Sci-Fi', 'Fantasy'],
      'War & Politics': ['Military', 'Drama'],
      'Family': ['Slice of Life'],
  }
  out = []
  for g in genres_list:
    name = g.get('name') if isinstance(g, dict) else str(g)
    if not name or name == 'Animation':  # Skip generic "Animation"
      continue
    if name in genre_map:
      out.extend(genre_map[name])
    else:
      out.append(name)

  # De-duplicate preserving order
  seen = set()
  result = []
  for item in out:
    if item not in seen:
      seen.add(item)
      result.append(item)
  return result


def get_tmdb_item_details(media_type, media_id):
  """Fetches full details for a TV show or movie from TMDb."""
  try:
    data = tmdb_request(f'{media_type}/{media_id}', {'append_to_response': 'keywords,credits'})
    title = data.get('name') if media_type == 'tv' else data.get('title')
    orig_title = data.get('original_name') if media_type == 'tv' else data.get('original_title')
    poster_path = get_best_poster_path(media_type, media_id, data.get('poster_path'))

    cover_url = f'https://image.tmdb.org/t/p/original{poster_path}' if poster_path else ''
    thumb_url = f'https://image.tmdb.org/t/p/w500{poster_path}' if poster_path else ''

    tmdb_genres = map_tmdb_genres(data.get('genres', []))

    # Cross-reference with AniList for romaji title and anime genres
    al = fetch_anilist_details(title or orig_title, orig_title=orig_title, media_type=media_type)
    romaji_title = (al.get('romajiTitle') if al else '') or orig_title or title or ''
    genres = (al.get('genres') if al and al.get('genres') else tmdb_genres) or tmdb_genres

    is_movie = media_type == 'movie'
    show_type = 'movie' if is_movie else 'series'
    format_type = 'movie' if is_movie else 'series'

    return {
        'id': f'tmdb:{media_type}:{media_id}',
        'tmdbId': media_id,
        'mediaType': media_type,
        'title': title or orig_title or '',
        'romajiTitle': romaji_title,
        'showType': show_type,
        'format': format_type,
        'genres': genres,
        'viewMethod': 'sub',
        'coverUrl': cover_url,
        'thumbnailUrl': thumb_url,
        'source': 'tmdb'
    }
  except Exception as e:
    print(f'Error fetching TMDb item {media_type}/{media_id}: {e}')
    return None


def search_tmdb(query):
  """Searches TMDb for TV shows and movies, or resolves a TMDb URL."""
  query = (query or '').strip()
  if not query:
    return []

  # 1. Check if user pasted a TMDb URL
  # e.g. https://www.themoviedb.org/tv/105248-cyberpunk-edgerunners
  # or https://www.themoviedb.org/movie/372058-your-name
  url_match = re.search(r'themoviedb\.org/(tv|movie)/(\d+)', query, re.IGNORECASE)
  if url_match:
    media_type = url_match.group(1).lower()
    media_id = int(url_match.group(2))
    item = get_tmdb_item_details(media_type, media_id)
    return [item] if item else []

  # Clean query string if URL
  search_term = query
  if 'themoviedb.org' in query:
    parts = [p for p in urllib.parse.urlparse(query).path.split('/') if p]
    if parts:
      search_term = parts[-1].replace('-', ' ')

  try:
    search_data = tmdb_request('search/multi', {
        'query': search_term,
        'include_adult': 'false'
    })
    raw_results = search_data.get('results', [])

    # Filter to tv and movie results that have poster_path or are Animation / Japanese
    candidates = []
    for r in raw_results:
      media_type = r.get('media_type')
      if media_type not in ('tv', 'movie'):
        continue
      genre_ids = r.get('genre_ids', [])
      orig_lang = r.get('original_language', '')
      # 16 is Animation in TMDb
      is_animation = 16 in genre_ids or orig_lang == 'ja'
      candidates.append((r, is_animation))

    # Prioritize anime/animation results, then by popularity
    candidates.sort(
        key=lambda pair: (pair[1], pair[0].get('popularity', 0)),
        reverse=True
    )

    enriched = []
    for r, _ in candidates[:6]:
      m_type = r.get('media_type')
      m_id = r.get('id')
      details = get_tmdb_item_details(m_type, m_id)
      if details and details.get('coverUrl'):
        enriched.append(details)

    return enriched
  except Exception as e:
    print(f'TMDb search error for "{query}": {e}')
    return []
