const socket = io("http://localhost:3000");

const messagesList = document.getElementById('messagesList');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

function displayMessage(content, type = 'server') {
    const msgEl = document.createElement('div');
    msgEl.classList.add('message', type);
    msgEl.textContent = content;
    messagesList.appendChild(msgEl);
    messagesList.scrollTop = messagesList.scrollHeight;
}

socket.on('server-message', (msg) => {
    const isUserMessage = msg.startsWith('You: ');
    displayMessage(msg, isUserMessage ? 'user' : 'server');
});

function sendMessage() {
    const msg = messageInput.value.trim();
    if (!msg) return;
    socket.emit('client-message', msg);
    messageInput.value = '';
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});