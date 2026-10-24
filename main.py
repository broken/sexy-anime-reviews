import json
import re
import urllib.parse
import urllib.request
from bottle import Bottle
from bottle import HTTPResponse
from bottle import mako_template as template
from bottle import redirect
from bottle import request
from bottle import response
from bottle import static_file
from google.appengine.api import users
try:
  from google.appengine.api import wrap_wsgi_app
except ImportError:
  wrap_wsgi_app = None

from crunchyroll import search_crunchyroll

app = Bottle()

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.


def is_admin_user():
  if request.headers.get('X-Appengine-User-Is-Admin') == '1':
    return True
  if request.environ.get('USER_IS_ADMIN') == '1':
    return True
  if request.environ.get('HTTP_X_APPENGINE_USER_IS_ADMIN') == '1':
    return True
  try:
    return users.is_current_user_admin()
  except Exception:
    return False


@app.route('/login')
def login():
  next_url = request.query.get('next', '/')
  if not next_url.startswith('/'):
    next_url = '/'
  redirect(next_url)


@app.route('/')
@app.route('/a/<name>')
def main(name=''):
  return template('views/main.html', is_admin=('true' if is_admin_user() else 'false'))

@app.route('/components/sar/<filepath:path>')
def sar(filepath):
  return static_file(filepath, root='components/sar')

@app.route('/add')
@app.route('/edit/<name>')
def add(name=''):
  return static_file('add.html', root='views')

@app.route('/pub/<filepath:path>')
def pub(filepath):
  return static_file(filepath, root='pub')

@app.route('/api/anime/search')
def api_anime_search():
  query = request.query.get('q', '').strip()
  if not query:
    response.content_type = 'application/json'
    return json.dumps({'error': 'Query parameter q is required', 'results': []})

  try:
    # 1. Primary: Search Crunchyroll for official metadata & logo covers
    cr_results = search_crunchyroll(query)
    if cr_results:
      response.content_type = 'application/json'
      return json.dumps({'success': True, 'results': cr_results, 'source': 'crunchyroll'})
  except Exception as e:
    print(f'Crunchyroll search error: {e}')

  # 2. Fallback: AniList search
  search_term = query
  if 'crunchyroll.com' in query:
    m = re.search(r'/series/[^/]+/([^/?#]+)', query)
    if m:
      search_term = ' '.join(m.group(1).replace('-', ' ').split())
    else:
      parts = [p for p in urllib.parse.urlparse(query).path.split('/') if p]
      if parts:
        search_term = ' '.join(parts[-1].replace('-', ' ').split())

  try:
    graphql = '''{
      Page(page: 1, perPage: 6) {
        media(search: %s, type: ANIME) {
          id
          title {
            romaji
            english
          }
          format
          genres
          coverImage {
            extraLarge
            large
            medium
          }
        }
      }
    }''' % json.dumps(search_term)

    payload = json.dumps({'query': graphql}).encode('utf-8')
    req = urllib.request.Request(
        'https://graphql.anilist.co',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
      data = json.loads(resp.read().decode('utf-8'))
      media_items = data.get('data', {}).get('Page', {}).get('media', [])
      results = []
      for item in media_items:
        title_en = item.get('title', {}).get('english') or item.get('title', {}).get('romaji') or ''
        title_romaji = item.get('title', {}).get('romaji') or ''
        fmt = item.get('format', '')
        show_type = 'movie' if fmt == 'MOVIE' else 'series'
        cover_img = item.get('coverImage', {})
        cover_url = cover_img.get('extraLarge') or cover_img.get('large') or cover_img.get('medium') or ''
        thumbnail_url = cover_img.get('medium') or cover_img.get('large') or cover_url
        genres = item.get('genres') or []
        results.append({
            'id': item.get('id'),
            'title': title_en,
            'romajiTitle': title_romaji,
            'showType': show_type,
            'genres': genres,
            'coverUrl': cover_url,
            'thumbnailUrl': thumbnail_url,
            'format': fmt,
            'viewMethod': 'sub'
        })
      response.content_type = 'application/json'
      return json.dumps({'success': True, 'results': results, 'source': 'anilist'})
  except Exception as e:
    response.content_type = 'application/json'
    return json.dumps({'error': str(e), 'results': []})

# This proxy route is so the browser can make the image request, allowing it to get the
# image bytes and around CORS restrictions if the client had made the request.
@app.route('/api/anime/proxy-image')
def api_proxy_image():
  img_url = request.query.get('url', '').strip()
  if not img_url or not (img_url.startswith('http://') or img_url.startswith('https://')):
    return HTTPResponse(status=400, body='Invalid image URL')

  try:
    req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
      content_type = resp.headers.get('Content-Type', 'image/jpeg')
      img_data = resp.read()
      response.content_type = content_type
      response.set_header('Cache-Control', 'public, max-age=86400')
      return img_data
  except Exception as e:
    return HTTPResponse(status=500, body=f'Failed to fetch image: {e}')

# Define an handler for 404 errors.
@app.error(404)
def error_404(error):
  """Return a custom 404 error."""
  return 'Sorry, nothing at this URL.'

if wrap_wsgi_app:
  app = wrap_wsgi_app(app)

if __name__ == '__main__':
  import bottle
  bottle.run(app=app, host='localhost', port=8080, debug=True)

