app = require('express')()

db = require './db'

app.get '/stops', (req, res) ->
  db.Stop.find {}, '-_id rsId name lat lng', (error, documents) ->
    res.json documents

app.get '/routes', (req, res) ->
  db.Route.find {}, '-_id number name kind runs.weekdays runs.times', (error, documents) ->
    res.json documents

app.listen process.env.PORT || 3000
