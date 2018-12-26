const app = require('express')()
const consign = require('consign')
const db = require('./config/db')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer')().single()
require('./config/mongodb')

app.db = db
app.mongoose = mongoose
app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(multer)


consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./schedule')
    .then('./config/routes.js')
    .into(app)
    
app.listen(3000, () => {
    console.log(process.env.DB_HOST)
    console.log('Executando Serviços...')
})