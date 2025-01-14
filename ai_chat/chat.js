// script.js
const chatBody = document.getElementById("chatBody");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatList = document.getElementById("chatList");
const shareBtn = document.getElementById("shareBtn");
const newChatBtn = document.getElementById("newChatBtn");

let currentChatTopic = "Untitled Chat";
let chats = JSON.parse(localStorage.getItem("chats")) || {};

// Common misspellings and their corrections
const commonCorrections = {
    "helllo": "hello",
    "hiii": "hi",
    "hii": "hi",
    "moring": "morning",
    "wheather": "weather",
    "temprutere": "temperature",
    "whats": "what's",
    "youre": "you're",
    "cant": "can't",
    "dont": "don't",
};

// Function to auto-correct user input
function autoCorrect(input) {
    const words = input.split(" ");
    const correctedWords = words.map((word) => {
        const lowerCaseWord = word.toLowerCase();
        return commonCorrections[lowerCaseWord] || word; // Replace if a correction exists
    });
    return correctedWords.join(" ");
}

function addMessage(message, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isUser ? "user" : "ai");
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (!chats[currentChatTopic]) chats[currentChatTopic] = [];
    chats[currentChatTopic].push({ isUser, message });
    localStorage.setItem("chats", JSON.stringify(chats));
}

function loadChat(topic) {
    chatBody.innerHTML = "";
    if (chats[topic]) {
        chats[topic].forEach(({ isUser, message }) => {
            addMessage(message, isUser);
        });
    }
    currentChatTopic = topic;
}

function saveChatTopic(topic) {
    const chatItem = document.createElement("li");
    chatItem.textContent = topic;
    chatItem.classList.add("chat-topic");

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "⋮";
    deleteBtn.classList.add("delete-btn");

    chatItem.appendChild(deleteBtn);
    chatList.appendChild(chatItem);

    chatItem.addEventListener("click", () => loadChat(topic));
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteChat(topic);
    });
}

function deleteChat(topic) {
    delete chats[topic];
    localStorage.setItem("chats", JSON.stringify(chats));
    renderChatList();
}

function renderChatList() {
    chatList.innerHTML = "";
    Object.keys(chats).forEach(saveChatTopic);
}

function startNewChat() {
    const topic = prompt("Enter a name for this chat:", `Chat ${Object.keys(chats).length + 1}`);
    if (topic) {
        currentChatTopic = topic;
        chats[topic] = [];
        localStorage.setItem("chats", JSON.stringify(chats));
        renderChatList();
        chatBody.innerHTML = "";
    }
}

messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default behavior (e.g., form submission)
        const userMessage = messageInput.value.trim();
        if (userMessage) {
            const correctedMessage = autoCorrect(userMessage); // Apply auto-correction
            addMessage(correctedMessage, true);
            messageInput.value = "";
            generateAIResponse(correctedMessage);
        }
    }
});


function shareCurrentChat() {
    if (!chats[currentChatTopic] || chats[currentChatTopic].length === 0) {
        alert("The current chat is empty. Start a conversation to share it!");
        return;
    }

    // Format the chat history
    let chatHistory = `📝 *Chat Topic*: ${currentChatTopic}\n\n`;
    chatHistory += chats[currentChatTopic]
        .map(({ isUser, message }) => `${isUser ? "👤 *You*" : "🤖 *AI*"}: ${message}`)
        .join("\n");

    // Add a footer message
    chatHistory += `\n\nShared via *Generator AI*.`;

    // Encode for WhatsApp sharing
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(chatHistory)}`;
    window.open(whatsappURL, "_blank");
}


sendBtn.addEventListener("click", () => {
    const userMessage = messageInput.value.trim();
    if (userMessage) {
        const correctedMessage = autoCorrect(userMessage); // Apply auto-correction
        addMessage(correctedMessage, true);
        messageInput.value = "";
        generateAIResponse(correctedMessage);
    }
});

newChatBtn.addEventListener("click", startNewChat);
shareBtn.addEventListener("click", shareCurrentChat);

function generateAIResponse(userMessage) {
    const responses = {
        "hi": "Hello! How can I assist you today?",
        "hello": "Hi there! How can I help you?",
        "how are you": "I'm just a bot, but I'm here to help you!",
        "what's your name": "I'm Generator.ai, your virtual assistant!",
        "time": `It's ${new Date().toLocaleTimeString()}.`,
        "date": `Today's date is ${new Date().toLocaleDateString()}.`,
        "weather": "Please tell me your city or state so I can fetch the weather for you.",
        "why should i use you ":"i am currently learning things",
    };

    if (responses[userMessage.toLowerCase()]) {
        addMessage(responses[userMessage.toLowerCase()], false);
    } else if (chatBody.lastChild && chatBody.lastChild.textContent.includes("Please tell me your city or state")) {
        fetchWeather(userMessage);
    } else {
        addMessage("I'm sorry, I didn't understand that. Could you rephrase?", false);
    }
}

async function fetchWeather(location) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=309fc3c28fe06cd2527e1258fc144ba6&units=metric`);
        const data = await response.json();
        if (data.main) {
            const weather = `The current weather in ${location} is ${data.main.temp}°C with ${data.weather[0].description}.`;
            addMessage(weather, false);
        } else {
            addMessage("Sorry, I couldn't fetch the weather for that location. Please check the name and try again.", false);
        }
    } catch (error) {
        addMessage("Sorry, I couldn't fetch the weather. Please try again later.", false);
    }
}
function copyToClipboard() {
    const botOutput = document.getElementById('bot-output').innerText;
    navigator.clipboard.writeText(botOutput).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy text: ' + err);
    });
}

renderChatList();
if (!currentChatTopic) startNewChat();
