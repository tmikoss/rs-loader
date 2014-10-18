fs      = require 'fs'
Q       = require 'q'
request = require 'request'

db = require './db'
ti = require './ti'

dbOperations = []

request "http://saraksti.rigassatiksme.lv/riga/stops.txt", (error, response, body) ->
  if error
    console.log error
    db.disconnect()
  else
    ti.loadStops body, (stops) ->
      for id, stop of stops
        do (id, stop) ->
          defer = Q.defer()
          dbOperations.push defer.promise
          db.Stop.findOneOrCreate { rsId: stop.id }, { rsId: stop.id, lat: stop.lat, lng: stop.lng, name: stop.name }, ->
            defer.resolve()

      request "http://saraksti.rigassatiksme.lv/riga/routes.txt", (error, response, body) ->
        if error
          console.log error
          db.disconnect()
        else
          ti.loadRoutes body, (routes) ->
            for id, route of routes
              do (id, route) ->
                defer = Q.defer()
                dbOperations.push defer.promise

                basicRoute = { number: route.num, name: route.name, kind: route.transport }
                db.Route.findOneOrCreate basicRoute, basicRoute, (err, doc) ->
                  defer.reject() unless doc

                  runs = []
                  for stop in route.stops
                    for weekdayIdx, weekdays of route.times.workdays
                      runs[weekdayIdx] ||= { weekdays: weekdays, times: [] }
                      runs[weekdayIdx].times.push { stop: stop, time: route.times.times.shift() }

                  doc.runs = runs
                  doc.save ->
                    defer.resolve()

            Q.allSettled(dbOperations).then -> db.disconnect()
