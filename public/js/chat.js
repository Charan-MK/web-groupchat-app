const socket = io()

//Elements
const $formSelector = document.getElementById("userForm")
const $msgInput = $formSelector.querySelector('input')
const $msgButton = $formSelector.querySelector('button')
const $locationButton = document.getElementById("locationBtn")

const $messages = document.querySelector('#messages')
const msgTemplate = document.querySelector("#message-template").innerHTML

let { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = ()=>{
    //get new message element
    let newMessage = $messages.lastElementChild

    //get height of new message
    let newMessageStyle = getComputedStyle(newMessage)
    let newMessageMargin = parseInt(newMessageStyle.marginBottom)
    let newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height: offsetHeight = viewable height of an element (in pixels), including padding, border and scrollbar, but not the margin.
    let visibleHeight = $messages.offsetHeight

    //height of messages container
    let containerHeight = $messages.scrollHeight

    //how far have i scrolled
    let scrolloffset = $messages.scrollTop + visibleHeight

    if((containerHeight - newMessageHeight) <= scrolloffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message)=>{
    // console.log(message)
    const html = Mustache.render(msgTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

const locationTemp = document.querySelector("#location-template").innerHTML

socket.on('locationMessage', location=>{
    // console.log(location)
    const html = Mustache.render(locationTemp, {
        username: location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

let sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    // console.log('users: ',users, 'room ',room)
})

const formSubmit = function(name){
    $msgButton.setAttribute('disabled', 'disabled')
    // alert("HI "+name.value)
    // console.log("Inside formSubmit")
    // let name = document.getElementById('name').value
    socket.emit("userMessage", name.value, (ack)=>{
        $msgButton.removeAttribute('disabled')
        $msgInput.value = ''
        $msgInput.focus()
        if(ack){
            return console.log(ack)
        }

        console.log("Message delivered")
    })
}

$locationButton.addEventListener('click', (e)=>{
    if(!navigator.geolocation){
        alert("Geo location featuer not available")
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log("Position of client", position)
        let location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        // console.log("Location object", location)
        socket.emit("sendLocation", location, (ack)=>{
            $locationButton.removeAttribute('disabled')
            console.log(ack)
        })
    })
})

//joining a specific room

socket.emit('JoinRoom', {username, room}, (error)=>{   
    if(error){
        location.href = '/'
        alert(error)
    }
})