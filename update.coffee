fs      = require 'fs'
Q       = require 'q'
request = require 'request'

db = require './db'
ti = require './ti'

loadStops = (processingStops) ->
  console.log "Loading stops"
  request "http://saraksti.rigassatiksme.lv/riga/stops.txt", (error, response, body) ->
    if error
      console.log error
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

loadRoutes = (processingRoutes) ->
  console.log "Loading routes"
  request "http://saraksti.rigassatiksme.lv/riga/routes.txt", (error, response, body) ->
    if error
      console.log error
      processingRoutes.reject error
      return

    ti.loadRoutes body

    dbOperations = []
    processed = 0
    total = ti.routes.length

    for id, route of ti.routes
      do (id, route) ->
        defer = Q.defer()
        dbOperations.push defer.promise
        defer.promise.then ->
          processed += 1
          console.log "Routes: #{processed} / #{total}"
        basicRoute = { number: route.num, name: route.name, kind: route.transport }
        db.Route.findOneOrCreate basicRoute, basicRoute, (error, document) ->
          defer.reject(error) if error

          runs = []
          for stop in route.stops
            for weekdayIdx, weekdays of route.times.workdays
              runs[weekdayIdx] ||= { weekdays: weekdays, times: {} }
              runs[weekdayIdx].times[stop] = route.times.times.shift()

          document.updatedAt = new Date
          document.runs = runs
          document.save (error) ->
            if error then defer.reject(error) else defer.resolve()

      Q.allSettled(dbOperations).then -> processingRoutes.resolve()


finished = -> db.disconnect()

db.Route.findOne({}).sort({ updatedAt: -1 }).findOne (error, document) ->
  mustUpdate = if !document
    true
  else if document.updatedAt
    age = new Date() - document.updatedAt
    ageHours = age / 1000 / 60 / 60
    ageHours > (7 * 24) - 1
  else
    true

  if mustUpdate
    processingStops  = Q.defer()
    processingRoutes = Q.defer()

    Q.allSettled([processingStops.promise, processingRoutes.promise]).then finished

    processingStops.promise.then -> loadRoutes(processingRoutes)
    loadStops(processingStops)
  else
    finished()
