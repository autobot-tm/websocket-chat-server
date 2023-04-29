const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
//do là class nên đặt chữ hoa
const Filter = require('bad-words')
const { createMsg } = require('./utils/create-msg')
const { getUserList, addUser, removeUser, findUser } = require('./utils/users')

const publicPathDirectory = path.join(__dirname, '../public')
app.use(express.static(publicPathDirectory))

const server = http.createServer(app)
const io = socketio(server)

//--lắng nghe sự kiện kết nối từ client, on page--
io.on('connection', (socket) => {
  //xử lý join room
  socket.on('join room from client to server', ({ room, username }) => {
    //xử lý cho client vào room
    socket.join(room)

    //chào
    //--gửi cho client thông vừa kết nối vào--
    socket.emit(
      'send message from server to client',
      createMsg(`Chào mừng bạn đến với phòng ${room}`, 'Admin')
    )

    //--gửi cho các client còn lại, ngoại trừ mình--
    socket.broadcast
      .to(room)
      .emit(
        'send message from server to client',
        createMsg(`${username} mới vừa tham gia vào phòng ${room}`, 'Admin')
      )

    //next page
    //--chat--
    socket.on('send message from client to server', (msgText, callback) => {
      //new mới 1 object
      const filter = new Filter()
      //add thêm ++
      filter.addWords('dm')
      //bắt lỗi word
      if (filter.isProfane(msgText)) {
        return callback('msgText không hợp lệ vì có chứa những từ 18+')
      }

      const id = socket.id
      const user = findUser(id)

      //post cho tất cả client đều thấy
      io.to(room).emit(
        'send message from server to client',
        createMsg(msgText, user.username)
      )

      //call back lại hàm acknowledgments() bên phía client
      callback()
    })

    //--xử lý chia sẻ vị trí--
    socket.on(
      'share location from client to server',
      ({ latitude, longitude }) => {
        const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`
        const id = socket.id
        const user = findUser(id)
        io.to(room).emit(
          'share location from server to client',
          createMsg(linkLocation, user.username)
        )
      }
    )

    //xử lý userlist
    const newUser = {
      id: socket.id,
      username,
      room,
    }
    addUser(newUser)
    io.to(room).emit('send user list from server to client', getUserList(room))

    //--ngắt kết nối--
    socket.on('disconnect', () => {
      removeUser(socket.id)
      io.to(room).emit(
        'send user list from server to client',
        getUserList(room)
      )
      console.log('Một người vừa rời khỏi nhóm chat')
    })
  })
})

const port = 4567
server.listen(port, () => {
  console.log(`app run on http://localhost:${port}`)
})
