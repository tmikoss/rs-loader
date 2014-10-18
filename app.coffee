db     = require './db'
fs     = require 'fs'
marked = require 'marked'

app = require('express')()

index = ""

fs.readFile './README.md', 'utf8', (error, markdown) ->
  index = """
    <html>
      <head>
        <title>RS-API</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
      </head>
      <body>
        <div class='container'>
          #{marked markdown}
        </div>
      </body>
    </html>
  """

app.get '/', (req, res) ->
  res.send index

app.get '/stops', (req, res) ->
  db.Stop.find {}, '-_id rsId name lat lng', (error, documents) ->
    res.json documents

app.get '/routes', (req, res) ->
  db.Route.find {}, '-_id number name kind direction runs.weekdays runs.times', (error, documents) ->
    res.json documents

app.listen process.env.PORT || 3000
