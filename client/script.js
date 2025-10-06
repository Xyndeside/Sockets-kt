const socket = io("http://localhost:3000");

const loginWrapper = document.getElementById('loginWrapper');
const chatWrapper = document.getElementById('chatWrapper');
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userList = document.getElementById('userList');
const messagesList = document.getElementById('messagesList');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const onlineCount = document.getElementById('onlineCount');

let username = null;
let currentUsers = [];

loginButton.addEventListener('click', login);
usernameInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') login();
});

logoutButton.addEventListener('click', () => {
    socket.emit('logout');
    chatWrapper.style.display = 'none';
    loginWrapper.style.display = 'flex';
    username = null;
    currentUsers = [];
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

function login() {
    const name = usernameInput.value.trim();
    if (!name) return;
    username = name;
    socket.emit('login', name);
    loginWrapper.style.display = 'none';
    chatWrapper.style.display = 'block';
}

function sendMessage() {
    const msg = messageInput.value.trim();
    if (!msg) return;
    socket.emit('client-message', msg);
    messageInput.value = '';
}

socket.on('server-message', msg => displayMessage(msg, 'server'));
socket.on('user-status', user => updateUser(user));
socket.on('all-users', users => {
    currentUsers = users;
    renderUsers(users);
    updateOnlineCount(users);
});

function displayMessage(msg, type) {
    const el = document.createElement('div');
    el.classList.add('message', `message-${type}`);
    el.textContent = msg;
    messagesList.appendChild(el);
    messagesList.scrollTop = messagesList.scrollHeight;
}

function renderUsers(users) {
    userList.innerHTML = '';
    users.forEach(u => {
        const el = document.createElement('div');
        el.textContent = u.name;
        el.className = u.online ? '' : 'user-offline';
        userList.appendChild(el);
    });
}

function updateUser(user) {
    const userIndex = currentUsers.findIndex(u => u.name === user.name);
    if (userIndex !== -1) {
        currentUsers[userIndex] = user;
    } else {
        currentUsers.push(user);
    }
    renderUsers(currentUsers);
    updateOnlineCount(currentUsers);
}

function updateOnlineCount(users) {
    const onlineUsers = users.filter(u => u.online).length;
    onlineCount.textContent = `${onlineUsers} участников онлайн`;
}

socket.on('connect', () => {
    if (username) {
        socket.emit('login', username);
    }
});