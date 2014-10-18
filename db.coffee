mongoose     = require 'mongoose'
findOrCreate = require 'mongoose-find-one-or-create'

mongoose.connect process.env.MONGOLAB_URI || 'mongodb://localhost/rs-loader'

stopSchema = new mongoose.Schema
  rsId: String
  name: String
  lat: Number
  lng: Number

stopSchema.plugin findOrCreate

routeSchema = new mongoose.Schema
  number: String
  name: String
  kind: String
  runs: [{
    weekdays: String
    times: {}
  }]

routeSchema.plugin findOrCreate

module.exports =
  Stop: mongoose.model 'Stop', stopSchema
  Route: mongoose.model 'Route', routeSchema
  disconnect: -> mongoose.disconnect()
