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
from tmdb import search_tmdb

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
  source = request.query.get('source', '').strip().lower()

  # Auto-detect source if a direct provider URL is pasted
  if 'themoviedb.org' in query.lower():
    source = 'tmdb'
  elif 'crunchyroll.com' in query.lower():
    source = 'crunchyroll'

  if not query:
    response.content_type = 'application/json'
    return json.dumps({'error': 'Query parameter q is required', 'results': []})

  if not source or source not in ('crunchyroll', 'tmdb'):
    response.content_type = 'application/json'
    return json.dumps({
        'error': 'Valid source parameter is required ("crunchyroll" or "tmdb")',
        'results': []
    })

  try:
    if source == 'tmdb':
      results = search_tmdb(query)
    else:
      results = search_crunchyroll(query)

    response.content_type = 'application/json'
    return json.dumps({'success': True, 'results': results, 'source': source})
  except Exception as e:
    print(f'Search error for source "{source}": {e}')
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

