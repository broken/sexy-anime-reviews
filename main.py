from bottle import Bottle
from bottle import mako_template as template
from bottle import static_file
from google.appengine.api import users

app = Bottle()

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.


@app.route('/')
@app.route('/a/<name>')
def main(name=''):
  return template('views/main.html', is_admin=('true' if users.is_current_user_admin() else 'false'))

@app.route('/components/sar/<filepath:path>')
def sar(filepath):
  return static_file(filepath, root='components/sar')

@app.route('/components/<filepath:path>')
def components(filepath):
  return static_file(filepath, root='bower_components')

@app.route('/add')
@app.route('/edit/<name>')
def add(name=''):
  return static_file('add.html', root='views')

@app.route('/pub/<filepath:path>')
def pub(filepath):
  return static_file(filepath, root='pub')


# Define an handler for 404 errors.
@app.error(404)
def error_404(error):
  """Return a custom 404 error."""
  return 'Sorry, nothing at this URL.'
