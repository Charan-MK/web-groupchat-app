let users = []

//add new users to the list after validation
const addUsers = ({id,username, room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!(username && room)){
        return {
            error: "Username and room are required"
        }
    }

    const existingUser = users.find((user)=>{
        return user.username == username && user.room == room
    })

    if(existingUser){
        return {
            error: "Username is taken"
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

//remove a user based on ID
const removeUsers = (id)=> {
    const index = users.findIndex((user )=> user.id== id)

    if(index != -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    let userByID = users.find((user)=>{
        return user.id === id
    })
    // console.log("this is the user by id in get user",userByID)
    return userByID
}

const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase()
    let roomUser = users.filter((user)=>{
        return user.room === room
    })
    
    return roomUser
}


module.exports = {
    getUser,
    getUserInRoom,
    addUsers, 
    removeUsers
}

// addUsers({
//     id:111,
//     username: "mk",
//     room: "tmk"
// })

// addUsers({
//     id:112,
//     username: "mkc",
//     room: "tmk"
// })
// addUsers({
//     id:113,
//     username: "cmk",
//     room: "tvk"
// })

// console.log(getUser(111))