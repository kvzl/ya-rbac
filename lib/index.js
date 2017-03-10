'use strict'

const _ = require('lodash')
const pathToRegexp = require('path-to-regexp')

/**
 * @callback Middleware
 * @param {object}    req
 * @param {object}    res
 * @param {function}  next
 */


/**
 * 權限管理 Middleware
 * @method permission
 * @param  {object}       setting
 * @param  {Middleware=}  setting.notAllowed
 * @param  {Middleware=}  setting.notLoggedIn
 * @param  {Config}       setting.config
 * @param  {string=}      [setting.field=user]
 * @return {Middleware}   Connect-style middleware
 */
const permission = (setting) => {

  const config = setting.config

  let field = setting.field
  let notLoggedIn = setting.notLoggedIn
  let notAllowed = setting.notAllowed


  /**
   * 將 config 轉換成方便處理的格式
   * @type {[{ resource: RegExp, actions: object }]}
   */
  const permissions = Object.keys(config)
    .map(p => ({
      resource: pathToRegexp(p),
      actions: config[p],
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

    /**
     * 檢查權限
     * @method check
     * @param  {object}                     actions   權限設定
     * @param  {string}                     method    方法
     * @param  {{ role: (string|number) }}  user      來自 `req[field]` 的登入資訊
     * @return {any}
     */
    const check = (actions, method, user) => {

      /**
       * 權限設定，必須為陣列或布林值
       * @type {[string|number]|boolean}
       */
      const action = actions[method]

      // action 非 false 且沒有登入資訊代表未登入
      if (action && !user) {
        return notLoggedIn(req, res, next)
      }


      // action 為陣列且 role 包含在內
      if (_.isArray(action) && _.includes(action, user.role)) {
        return next()
      }


      /**
        * action 為 false，無論是否登入都能通過
        * （為 true 但未登入的情況已經先排除掉了）
        */
      if (_.isBoolean(action)) {
        return next()
      }


      if (method === '*') {
        return notAllowed(req, res, next)
      }
      return check(actions, '*', user)

    }


    /**
     * @type {string}
     */
    const method = req.method.toUpperCase()

    // 符合路徑比對的規則
    const perm = _.find(permissions, p => {
      const url = req.originalUrl.replace(/\?(\S|\s)*/gi, '')
      return url.match(p.resource)
    })


    if (!perm) {
      return notAllowed(req, res, next)
    }


    return check(perm.actions, method, req[field])

  }

}

module.exports = permission
