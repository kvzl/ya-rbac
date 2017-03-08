module.exports = {
  '/api/users/:id/name': {
    'GET': ['user', 'admin'],
    'POST': ['admin'],
  },
  '/api/users': {
    'GET': 'user',
    'POST': 'user',
  },
  '/api/user-only': 'user',
  '/api/admin-only': 'admin'
}
