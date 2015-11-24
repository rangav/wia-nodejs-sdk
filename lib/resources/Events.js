'use strict';

var Error = require('../Error');
var request = require('request');

function WiaResourceEvents(wia) {
  this.publish = function(opt, cb) {
    if (wia.getApiField('restOnly')) {
      request.post(wia.getApiUrl() + "events", {
        auth: {
          bearer: wia.getApiField('accessToken')
        },
        body: opt,
        json: true,
        headers: wia.getHeaders()
      }, function (error, response, body) {
        if (cb) {
          if (error) return cb(error, null);
          if (response.statusCode == 200 || response.statusCode == 201)
            cb(null, body);
          else
            cb(new Error.WiaRequestException(response.statusCode, body || ""), null);
        }
      });
    } else {
      if (!opt.name) {
        return cb({message: "name must be specified."}, null);
      }
      wia.stream.publish('device/event', JSON.stringify(opt), cb);
      // wia.stream.publish('devices/' + "key" + '/events/' + opt.name, JSON.stringify(opt), cb);
    }
  },
  this.subscribe = function(opt, cb) {
    if (wia.getApiField('restOnly')) {
      return cb({message: "restOnly must be set to false to subscribe to events." }, null);
    }
    if (!opt.deviceKey) {
      return cb({message: "deviceKey not specified." }, null);
    }
    if (!opt.name) {
      wia.stream.subscribe('devices/' + opt.deviceKey + '/events/+', cb);
    } else {
      wia.stream.subscribe('devices/' + opt.deviceKey + '/events/' + opt.name, cb);
    }
  },
  this.unsubscribe = function(opt, cb) {
    if (wia.getApiField('restOnly')) {
      return cb({message: "restOnly must be set to false to subscribe to events." }, null);
    }
    if (!opt.deviceKey) {
      return cb({message: "deviceKey not specified." }, null);
    }
    if (!opt.name) {
      wia.stream.unsubscribe('devices/' + opt.deviceKey + '/events/+', cb);
    } else {
      wia.stream.unsubscribe('devices/' + opt.deviceKey + '/events/' + opt.name, cb);
    }
  },
  this.list = function(opt, cb) {
    request.get(wia.getApiUrl() + "events", {
      auth: {
        bearer: wia.getApiField('accessToken')
      },
      qs: opt || {},
      json: true,
      headers: wia.getHeaders()
    }, function (error, response, body) {
      if (cb) {
        if (error) return cb(error, null);
        if (response.statusCode == 200)
          cb(null, body);
        else
          cb(new Error.WiaRequestException(response.statusCode, body || ""), null);
      }
    });
  }
}

module.exports = WiaResourceEvents;