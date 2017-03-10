const { Result, check, match, formatConfig } = require('../lib/permission')


describe('Permission', () => {

  it('which is not specified in config is not allowed', () => {
    const config = {
      GET: true,
    }

    const user = {
      role: 'knight',
    }

    expect(check(config, 'GET', user)).toEqual(Result.GRANTED)
    expect(check(config, 'POST', user)).toEqual(Result.NOT_ALLOWED)
  })


  it('is set to false to grant without checking log-in status', () => {
    const config = {
      GET: false,
    }

    expect(check(config, 'GET', null)).toEqual(Result.GRANTED)
  })


  it('is set to true to grant without checking role', () => {
    const config = {
      GET: true,
    }

    const user = {
      role: 'farmer',
    }

    expect(check(config, 'GET', user)).toEqual(Result.GRANTED)

    // you still need to log in
    expect(check(config, 'GET', null)).toEqual(Result.NOT_LOGGED_IN)
  })


  it('should look for \'*\' when method cannot be found', () => {
    const config = {
      '*': false,
    }

    expect(check(config, 'PATCH', null)).toEqual(Result.GRANTED)
  })


  it('is set to array to check whether role is included in or not', () => {
    const config = {
      GET: ['farmer'],
      POST: ['farmer', 'knight'],
    }

    const user = {
      role: 'knight',
    }

    expect(check(config, 'GET', user)).toEqual(Result.NOT_ALLOWED)
    expect(check(config, 'POST', user)).toEqual(Result.GRANTED)
  })


})


test('Using regex to match request resource with resources specified in config', () => {
  const permissions = formatConfig({
    '/api/posts': {
      '*': false,
    },
  })

  expect(match(permissions, '/api/posts')).not.toBeFalsy()
  expect(match(permissions, '/api/posts?limit=12&page=2')).not.toBeFalsy()
  expect(match(permissions, '/api/users')).toBeFalsy()

})
