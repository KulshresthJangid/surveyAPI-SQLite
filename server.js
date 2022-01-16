"use strick";
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const cookieParser = require('cookie-parser')

const app = express()

const routes = require('./routes/routes');
const { contentDisposition } = require('express/lib/utils');

app.use(cookieParser())
app.use(routes)

const port = 3000

app.listen(port, () => {
    console.log(`Up and running on ${port}`)
})

