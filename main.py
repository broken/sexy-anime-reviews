from bottle import Bottle
from bottle import mako_template as template
from bottle import static_file
from google.appengine.api import users

bottle = Bottle()

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.


@bottle.route('/')
@bottle.route('/a/<name>')
def main(name=''):
  return template('views/main.html', is_admin=users.is_current_user_admin())

@bottle.route('/components/sar/<filepath:path>')
def sar(filepath):
  return static_file(filepath, root='components/sar')

@bottle.route('/components/<filepath:path>')
def components(filepath):
  return static_file(filepath, root='bower_components')

@bottle.route('/add')
def add():
  return static_file('add.html', root='views')


# Define an handler for 404 errors.
@bottle.error(404)
def error_404(error):
  """Return a custom 404 error."""
  return 'Sorry, nothing at this URL.'
