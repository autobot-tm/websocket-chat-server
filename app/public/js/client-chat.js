//yêu cầu server kết nối với client
const socket = io()

//xử lý query string để lấy username và room when user input
const queryString = location.search
const params = Qs.parse(queryString, {
  ignoreQueryPrefix: true,
})
const { room, username } = params

//hiện tên room
document.getElementById('room-name').innerHTML = room
socket.emit('join room from client to server', { room, username })

//xử lý user list
socket.on('send user list from server to client', (userList) => {
  let contentHtml = ''
  userList.map((user) => {
    contentHtml += `
      <li class="user">
        ${user.username}
      </li>
    `
  })
  document.getElementById('users-list').innerHTML = contentHtml
})

//xử lý msg chat và thông báo cho users
socket.on('send message from server to client', (msgTextt) => {
  const { msgText, createdAt, username } = msgTextt
  const htmlContent = document.getElementById('messages').innerHTML
  const messageEle = `
                        <div class="msg-item">
                            <div class="msg-row1">
                              <p class="msg-name">${username} <i style="color: silver">${createdAt}</i></p>
                          </div>
                            <div class="msg-row2">
                              <p class="msg-content" style="background-color: rgb(0, 132, 255); 
                                              display: inline-block;
                                              border-bottom-right-radius: 18px;
                                              border-bottom-left-radius: 4px;
                                              border-top-right-radius: 18px;
                                              border-top-left-radius: 4px;
                                              padding-bottom: 8px;
                                              padding-right: 12px;
                                              padding-left: 12px;
                                              padding-top: 8px;
                              ">${msgText}</p>
                          </div>
                        </div>
  `
  let contenRender = htmlContent + messageEle
  document.getElementById('messages').innerHTML = contenRender

  // Scroll to bottom of messages
  messages.scrollTop = messages.scrollHeight
})

//--bắt sự kiện form chat theo id--
document.getElementById('form-msg').addEventListener('submit', (e) => {
  //chặn loading page mỗi khi user click liên tục
  e.preventDefault()
  //get id dom
  const msgText = document.getElementById('input-msg')
  const message = msgText.value

  //bắt lỗi bad words và thông báo lên user
  const acknowledgments = (errors) => {
    if (errors) {
      return alert('tin nhắn không hợp lệ')
    }
    console.log('Đã gửi!')
  }
  socket.emit('send message from client to server', message, acknowledgments)

  //dùng để xoá tin nhắn
  msgText.value = ''
})

//gửi vị trí
document.getElementById('btn-share-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('browser đang dùng không có hỗ trợ tìm định vị')
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords
    socket.emit('share location from client to server', { latitude, longitude })
  })
})

socket.on('share location from server to client', (data) => {
  const { msgText, createdAt, username } = data
  const htmlContent = document.getElementById('messages').innerHTML
  const messageEle = `  
                            <div class="msg-row2">
                              <p class="msg-content">
                               <a href="${msgText}" target="_blank"> 
                                  Vị trí của ${username}
                               </a>
                              </p>
                            </div>        
  `
  let contenRender = htmlContent + messageEle
  document.getElementById('messages').innerHTML = contenRender
})
