const _ = require('lodash')
const pathToRegexp = require('path-to-regexp')

/**
 * 方法對應的權限
 * @typedef {Object.<string, (string|string[])>}  MethodTable
 */

/**
 * 資源所對應的權限
 * @typedef {{ resource: RegExp, actions: (string|MethodTable) }}   Permission
 */

/**
 * 權限管理 Middleware
 * @method permission
 * @param  {object}       setting
 * @param  {function=}    setting.notAllowed
 * @param  {function=}    setting.notLoggedIn
 * @param  {Config}       setting.config
 * @param  {string=}      [setting.field=user]
 * @return {function}     Connect-style middleware
 */
const permission = ({ notAllowed, notLoggedIn, config, field }) => {

  /**
   * 將 config 轉換成方便處理的格式
   * @type {Permission[]}
   */
  const permissions = Object.keys(config)
    .map(p => ({
      resource: pathToRegexp(p),
      actions: config[p]
    }))

  /**
   * 權限不符的預設處理方式
   */
  if (!notAllowed) {
    notAllowed = (req, res, next) => {
      next({ message: 'Not allowed.', })
    }
  }

  /**
   * 未登入的預設處理方式
   */
  if (!notLoggedIn) {
    notLoggedIn = (req, res, next) => {
      next({ message: 'Not logged in.', })
    }
  }

  /**
   * 自訂權限欄位
   * 預設為 `req.user.role`
   */
  if (!field) {
    field = 'user'
  }

  return (req, res, next) => {

    if (!req.user) {
      return notLoggedIn(req, res, next)
    }


    /**
     * @type {string}
     */
    const role = req[field].role

    /**
     * @type {string}
     */
    const method = req.method.toUpperCase()

    /**
     * 符合路徑比對的規則
     */
    const perm = _.find(permissions, p => req.url.match(p.resource))

    if (!perm) {
      return notAllowed(req, res, next)
    }


    /**
     * @type {(string|MethodTable)}
     */
    const actions = perm.actions

    if (_.isString(actions) && actions === role) {
      return next()
    }
    else if (actions[method] && _.includes(actions[method], role)) {
      return next()
    }
    else {
      return notAllowed(req, res, next)
    }

  }

}

module.exports = permission
