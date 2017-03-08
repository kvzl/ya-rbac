const _ = require('lodash')
const pathToRegexp = require('path-to-regexp')
const express = require('express')
const app = new express()
const router = express.Router()

const permission = require('../lib')


router.use('/api/users', (req, res, next) => {
  res.status(200).json({ message: '/api/users' })
})
router.use('/api/users/:id/name', (req, res, next) => {
  res.status(200).json({ message: '/api/users/:id/name' })
})
router.use('/api/user-only', (req, res, next) => {
  res.status(200).json({ message: '/api/user-only' })
})
router.use('/api/admin-only', (req, res, next) => {
  res.status(200).json({ message: '/api/admin-only' })
})


app.use((req, res, next) => {

  const { dev } = req.headers

  if (dev === 'admin') {
    req.user = { role: 'admin' }
  } else if (dev === 'user') {
    req.user = { role: 'user' }
  }

  next()

})


app.use(permission({ config: require('./config') }))

app.use(router)

app.use((err, req, res, next) => {
  console.log(err)
  res.json(err)
})

app.listen(3001)
