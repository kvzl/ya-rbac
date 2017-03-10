# ya-rbac

Yet another role-based access controll for Express.

# How to use

Here is a simple example to demo how to use ya-rbac.

```JavaScript
const permission = require('ya-rbac')

const NOTLOGIN = { status: 401, message: 'Not login' }
const PERMISSIONDENIED = { status: 403, message: 'Not allow' }

const config = {

  // true => need to login, everyone who have login can access.
  // false => do not need to login, everyone can access.

  '/admin-api/v1.0/admins/login': {
    POST: false, // This meant everyone can POST /admin-api/v1.0/admins/login
  },
  
  '/admin-api/v1.0/courses': {
    GET: [ 'admin', 'teacher', 'student' ], // This meant only role = admin, teacher or student can access GET /admin-api/v1.0/courses
    DELETE: [ 'admin' ] // This meant only role = admin can access DELETE /admin-api/v1.0/courses
  },
  
}

const rbac = {
  admin: permission({
    config, 
    field: 'admin', // This meant ya-rbac can get user role by req.admin.role
    notLoggedIn: (req, res, next) => next(NOTLOGIN), // Not login handler funciton
    notAllowed: (req, res, next) => next(PERMISSIONDENIED), // Not allow handler function
  }),
}

app.use('/admin-api/v1.0/users', rbac.admin, require('./routes/apis/adminUser.js'))
```

