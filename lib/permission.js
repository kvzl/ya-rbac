'use strict'

const _ = require('lodash')
const pathToRegexp = require('path-to-regexp')


/**
 * @callback Middleware
 * @param {object}    req
 * @param {object}    res
 * @param {function}  next
 * @param {any}
 */


/**
 * 檢查結果
 * @typedef {string} Result
 */
const Result = {
  NOT_ALLOWED: 'NOT_ALLOWED',
  NOT_LOGGED_IN: 'NOT_LOGGED_IN',
  GRANTED: 'GRANTED',
}


/**
 * 檢查權限
 * @method check
 * @param  {object}                     actions   權限設定
 * @param  {string}                     method    方法
 * @param  {{ role: (string|number) }}  user      來自 `req[field]` 的登入資訊
 * @return {Result}
 */
const check = (actions, method, user) => {

  /**
   * 權限設定，必須為陣列或布林值
   * @type {[string|number]|boolean}
   */
  const action = actions[method]

  // action 非 false 且沒有登入資訊代表未登入
  if (action && !user) {
    return Result.NOT_LOGGED_IN
  }

  // action 為陣列且 role 包含在內
  if (_.isArray(action) && _.includes(action, user.role)) {
    return Result.GRANTED
  }

  // action 為 false，無論是否登入都能通過
  // （為 true 但未登入的情況已經先排除掉了）
  if (_.isBoolean(action)) {
    return Result.GRANTED
  }

  // 找不到權限設定
  if (method === '*') {
    return Result.NOT_ALLOWED
  }

  return check(actions, '*', user)

}

/**
 * @typedef { resource: RegExp, actions: object } Permission
 */

/**
 * 將 config 轉換成方便處理的格式
 * @method  formatConfig
 * @param   {object} config
 * @return  {[ Permission ]}
 */
const formatConfig = (config) => Object.keys(config)
  .map(p => ({
     resource: pathToRegexp(p),
     actions: config[p],
  }))


/**
 * 找出請求的 url 對應的權限
 * @method match
 * @param  {[ Permission ]}   permissions   權限表（格式化後的 config）
 * @param  {string}           originalUrl   請求的 url
 * @return {Permission}
 */
const match = (permissions, originalUrl) => {
  const resource = originalUrl.replace(/\?(\S|\s)*/gi, '')
  return _.find(permissions, p => resource.match(p.resource))
}


/**
 * 權限管理 Middleware
 * @method permission
 * @param  {object}       setting
 * @param  {Middleware=}  setting.notAllowed
 * @param  {Middleware=}  setting.notLoggedIn
 * @param  {object}       setting.config
 * @param  {string=}      [setting.field=user]
 * @return {Middleware}   Connect-style middleware
 */
const permission = (setting) => {

  let { field, notLoggedIn, notAllowed } = setting

  const permissions = formatConfig(setting.config)

  // 權限不符的預設處理方式
  if (!notAllowed) {
    notAllowed = (req, res, next) => {
      next({ message: 'Not allowed.', })
    }
  }

  // 未登入的預設處理方式
  if (!notLoggedIn) {
    notLoggedIn = (req, res, next) => {
      next({ message: 'Not logged in.', })
    }
  }

  // 自訂權限欄位
  // 預設為 `req.user.role`
  if (!field) {
    field = 'user'
  }


  return (req, res, next) => {

    /**
     * @type {string}
     */
    const method = req.method.toUpperCase()

    // 符合路徑比對的規則
    const perm = match(permissions, req.originalUrl)

    if (!perm) {
      return notAllowed(req, res, next)
    }

    const result = check(perm.actions, method, req[field])

    switch (result) {
      case Result.NOT_ALLOWED:
        return notAllowed(req, res, next)

      case Result.NOT_LOGGED_IN:
        return notLoggedIn(req, res, next)

      case Result.GRANTED:
        return next()
    }

  }

}


module.exports = {
  Result,
  check,
  formatConfig,
  match,
  permission,
}
