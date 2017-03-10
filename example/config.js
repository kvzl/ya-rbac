module.exports = {
  '/api/login': {
    'GET': false,
  },

  '/api/all-pass': {
    '*': true,
  },

  '/api/users/:id/name': {
    '*': ['admin'],
    'GET': ['user', 'admin'],
    'POST': ['admin'],
  },

  '/api/users': {
    '*': ['admin'],
    'GET': ['user'],
    'POST': ['user'],
  },

  '/api/user-only': {
    '*': ['user'],
  },

  '/api/admin-only': {
    '*': ['admin'],
  },
}
