'use strict';var _=require('lodash');var pathToRegexp=require('path-to-regexp');var Result={NOT_ALLOWED:'NOT_ALLOWED',NOT_LOGGED_IN:'NOT_LOGGED_IN',GRANTED:'GRANTED'};var check=function check(actions,method,user){var action=actions[method];if(action&&!user){return Result.NOT_LOGGED_IN}if(_.isArray(action)&&_.includes(action,user.role)){return Result.GRANTED}if(_.isBoolean(action)){return Result.GRANTED}if(method==='*'){return Result.NOT_ALLOWED}return check(actions,'*',user)};var formatConfig=function formatConfig(config){return Object.keys(config).map(function(p){return{resource:pathToRegexp(p),actions:config[p]}})};var match=function match(permissions,originalUrl){var resource=originalUrl.replace(/\?(\S|\s)*/gi,'');return _.find(permissions,function(p){return resource.match(p.resource)})};var permission=function permission(setting){var field=setting.field,notLoggedIn=setting.notLoggedIn,notAllowed=setting.notAllowed;var permissions=formatConfig(setting.config);if(!notAllowed){notAllowed=function notAllowed(req,res,next){next({message:'Not allowed.'})}}if(!notLoggedIn){notLoggedIn=function notLoggedIn(req,res,next){next({message:'Not logged in.'})}}if(!field){field='user'}return function(req,res,next){var method=req.method.toUpperCase();var perm=match(permissions,req.originalUrl);if(!perm){return notAllowed(req,res,next)}var result=check(perm.actions,method,req[field]);switch(result){case Result.NOT_ALLOWED:return notAllowed(req,res,next);case Result.NOT_LOGGED_IN:return notLoggedIn(req,res,next);case Result.GRANTED:return next();}}};module.exports={Result:Result,check:check,formatConfig:formatConfig,match:match,permission:permission};