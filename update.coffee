fs      = require 'fs'
Q       = require 'q'
request = require 'request'

db = require './db'
ti = require './ti'

processingStops  = Q.defer()
processingRoutes = Q.defer()

Q.allSettled([processingStops.promise, processingRoutes.promise]).then -> db.disconnect()

loadStops = ->
  request "http://saraksti.rigassatiksme.lv/riga/stops.txt", (error, response, body) ->
    if error
      processingStops.reject error
      return

    ti.loadStops body

    dbOperations = []

    for id, stop of ti.stops
      do (id, stop) ->
        defer = Q.defer()
        dbOperations.push defer.promise
        db.Stop.findOneOrCreate { rsId: stop.id }, { rsId: stop.id, lat: stop.lat, lng: stop.lng, name: stop.name }, (error) ->
          if error then defer.reject(error) else defer.resolve()

    Q.allSettled(dbOperations).then -> processingStops.resolve()

loadRoutes = ->
  request "http://saraksti.rigassatiksme.lv/riga/routes.txt", (error, response, body) ->
    if error
      processingRoutes.reject error
      return

    ti.loadRoutes body

    dbOperations = []

    for id, route of ti.routes
      do (id, route) ->
        defer = Q.defer()
        dbOperations.push defer.promise

        basicRoute = { number: route.num, name: route.name, kind: route.transport }
        db.Route.findOneOrCreate basicRoute, basicRoute, (error, document) ->
          defer.reject(error) if error

          runs = []
          for stop in route.stops
            for weekdayIdx, weekdays of route.times.workdays
              runs[weekdayIdx] ||= { weekdays: weekdays, times: {} }
              runs[weekdayIdx].times[stop] = route.times.times.shift()

          document.runs = runs
          document.save (error) ->
            if error then defer.reject(error) else defer.resolve()

      Q.allSettled(dbOperations).then -> processingRoutes.resolve()

processingStops.promise.then loadRoutes
loadStops()
