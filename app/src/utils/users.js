let userList = [
  {
    id: '1',
    username: 'Nguyễn Minh Thành',
    room: 'SE1515',
  },
  {
    id: '2',
    username: 'Tạ Yến',
    room: 'SE2023',
  },
]

const addUser = (newUser) => {
  return (userList = [...userList, newUser]) //es6
}

const getUserList = (room) => {
  return userList.filter((user) => user.room === room)
}

const removeUser = (id) => {
  return (userList = userList.filter((user) => user.id !== id))
}

const findUser = (id) => {
  const username = userList.find((user) => user.id === id)
  return username
}

module.exports = {
  getUserList,
  addUser,
  removeUser,
  findUser,
}
