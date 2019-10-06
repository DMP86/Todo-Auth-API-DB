const express = require('express')
const app = express()
const path = require('path')
const {sequelize} = require('./models/todo')
const {checkToken} = require('./config/check-token')
const helmet =  require('helmet')
const compression =  require('compression')
const cors = require('cors')

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

app.use(helmet())
app.use(compression())

app.use('/api/todo', checkToken)

app.use('/api/todo', require('./routes/api'))
app.use('/api/auth', require('./routes/auth'))

const PORT = +process.env.PORT || 3000
async function start () {
    try {
        await sequelize.sync()
        app.listen(PORT, function(){
            console.log(`http listening on ${PORT}`) 
        })
    } catch(e) {
        console.log(e)
    }
}

start()

