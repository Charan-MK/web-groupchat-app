const path = require("path")
const express = require("express")
const app = express()
const http = require('http')
const socket = require('socket.io')

const Filter = require('bad-words')

const server = http.createServer(app)
const io = socket(server)
const port = process.env.PORT || 3000

let {generateMessage}  = require('./utils/messages')
let {getUser, getUserInRoom,addUsers, removeUsers } = require('./utils/users')
app.use(express.static((path.join(__dirname, "../public"))))

// app.get("/", (req, res)=>{
//     res.sendFile("index.html", {root: path.join(__dirname, "../public")})
// })


io.on('connection', (socket)=>{
    console.log("New websocket connection")

    socket.on('JoinRoom', ({username, room}, callback)=>{
        let {error, user} = addUsers({id: socket.id, username: username, room: room})  
        if(error){
            return callback(error)
        } 
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', `welcome to the room ${user.room}`))
        socket.broadcast.to(room).emit('message', generateMessage('Admin',`New user ${user.username} has joined the room`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })
    socket.on('userMessage', (msg, callback)=>{
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback("Profane is  not allowed")
        }
        // console.log("socket id", socket.id)
        let user = getUser(socket.id)
        if(!user){
            return callback("User not found")
        }

        io.to(user.room).emit('message', generateMessage(user.username,msg))
        callback()
        // console.log('message from client', msg)
    })

    socket.on("sendLocation", (data, callback)=>{
        // console.log("Location of the client is: ", data)
        let user = getUser(socket.id)

        if(!user){
            return callback('user not found')
        }
        callback("Location Shared")
        io.to(user.room).emit("locationMessage", generateMessage(user.username,`https://google.com/maps?q=${data.latitude},${data.longitude}`))
    })

    socket.on('disconnect', ()=>{
        let user = removeUsers(socket.id)

        if(user){
            // console.log(`User ${user.username} left the room ${user.room}`)
            io.to(user.room).emit("message", generateMessage('Admin',`User ${user.username} left`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})


server.listen(port, ()=>{
    console.log(`server running at http://127.0.0.1:${port}`)
})