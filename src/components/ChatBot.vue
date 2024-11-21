<template>
  <div class="chatbot-container">
    <div class="chat-history" ref="chatHistory">
      <div v-for="(msg, index) in messages" :key="msg.timestamp" class="chat-message">
  <span 
    :class="{
      'user-name': msg.sender === userName && userName,  
      'bot-name': msg.sender === 'Eliza',
      'default-user': msg.sender === 'Usuario'
    }">
    {{ msg.sender }}:
  </span> 
  {{ msg.text }}
</div>

    </div>
    <input 
      type="text" 
      v-model="newMessage" 
      @keyup.enter="sendMessage" 
      placeholder="Escribe tu mensaje..." 
    />
  </div>
</template>

<script>
import  ElizaBot from 'elizabot'
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Conectado al servidor del socket");
});

export default {
  data() {
    return {
      messages: [
        { sender: "Eliza", text: "Hello. What is your name?"}
      ],
      newMessage: "",
      userName: null,
      bot: new ElizaBot(),
    };
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === "") return;

      const userMessage = {
        sender: this.userName ? this.userName : "Usuario",
        text: this.newMessage,
        timestamp: Date.now(), 
      };

      this.messages.push(userMessage);

      if (!this.userName) {
        this.userName = this.newMessage.trim();
        const botMessage = {
          sender: "Eliza",
          text: `Hi, ${this.userName}! How can I help you?`,
          timestamp: Date.now(),
        };
        this.messages.push(botMessage);
      } else {
        const botMessage = {
        sender: "Eliza",
        text: this.bot.transform(this.newMessage),
        timestamp: Date.now(),
      }

      this.messages.push(botMessage)
        socket.emit("userMessage", this.newMessage);
        console.log("Enviando mensaje al servidor");
      }

      this.newMessage = "";
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    scrollToBottom() {
      const chatHistory = this.$refs.chatHistory;
      if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    },
  },
  mounted() {

    socket.on("chatHistory", (messages) => {
      this.messages = messages;
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    });

    socket.on("botResponse", (botMessage) => {
      this.messages.push(botMessage);
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    });

    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
};
</script>

<style>
.chatbot-container {
  width: 100%;
  max-width: 400px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  background-color: #f9f9f9;
}

.chat-history {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.chat-message {
  margin: 5px 0;
}

.user-name{ 
  color: blue;
  font-weight: bold;
}

.bot-name {
  color: pink;
  font-weight: bold;
}

.default-user {
  color: green;
  font-weight: bold;
}
</style>