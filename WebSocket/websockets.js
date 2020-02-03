//Балансировка нескольких WebSocket с помощью Ngixnx
let redis = require('socket.io-redis');
const cors = require('cors')
const path = require('path')

const PORT = Number(process.argv[2])
const express = require('express')
const app = express()

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

const http = require('http')
   
const server = http.createServer(app);
let io = require('socket.io').listen(server); 
io.adapter(redis({ host: 'localhost', port: 6379 }));
   
const clients = {}

io.on('connection', (socket) => {
    const id = socket.id
    console.log(id)

    /* io.of('/').adapter.clients((err, clientsRedis) => {
        console.log(clientsRedis); // an array containing all connected socket ids
    }); */
    
    socket.on('addUser', ({name}) => {
        
        clients[id] = name || 'Guest'
        console.log(clients[id])
        socket.send({
            type: 'Hellow',
            message: `Hellow ${clients[id]} from ${PORT} your id is ${id}`,
            id,
        })

        socket.broadcast.send({
            type: 'Hellow',
            message: `New user ${clients[id]}`
        })

    })

    socket.on('message', (message, callback) => {
    
        if(message) {
            callback()

            socket.send({
                type: 'message',
                message: message.message,
                author: message.author
            })

            socket.broadcast.send({
                type: 'message',
                message: message.message,
                author: message.author
            })
        } else callback('Empty message')
    })

    socket.on('disconnect', () => {
        delete(clients.id)
    })
})

server.listen(PORT, ()=>{
    console.log("Listen port", PORT)
})


