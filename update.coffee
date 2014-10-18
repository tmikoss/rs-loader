fs = require 'fs'
Q  = require 'q'
db = require './db'
ti = require './ti'

dbOperations = []

fs.readFile "./test_data/stops.txt", "utf8", (err, data) ->
  if err
    console.log err
    db.disconnect()

  ti.loadStops data, (stops) ->
    for id, stop of stops
      do (id, stop) ->
        defer = Q.defer()
        dbOperations.push defer.promise
        db.Stop.findOneOrCreate { rsId: stop.id }, { rsId: stop.id, lat: stop.lat, lng: stop.lng, name: stop.name }, ->
          defer.resolve()

    fs.readFile "./test_data/routes.txt", "utf8", (err, data) ->
      if err
        console.log err
        db.disconnect()

      ti.loadRoutes data, (routes) ->
        for id, route of routes
          do (id, route) ->
            defer = Q.defer()
            dbOperations.push defer.promise

            basicRoute = { number: route.num, name: route.name, kind: route.transport }
            db.Route.findOneOrCreate basicRoute, basicRoute, (err, doc) ->
              console.log "processing", route.name
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
