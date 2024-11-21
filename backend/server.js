const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

mongoose.connect('mongodb://localhost:27017/chatbotDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Conectado a MongoDB");
    })
    .catch((error) => {
        console.error("Error de conexión a MongoDB:", error);
    });

const messageSchema = new mongoose.Schema({
    sender: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on("connection", async (socket) => {
    console.log("Cliente conectado");

    try {
        const messages = await Message.find(); 
        socket.emit("chatHistory", messages);
    } catch (error) {
        console.error("Error al recuperar mensajes:", error);
    }

    socket.on("userMessage", async (message) => {
        console.log("Mensaje del usuario:", message);

        const userMessage = new Message({
            sender: "Usuario",
            text: message,
        });

        try {
            await userMessage.save();
        } catch (error) {
            console.error("Error al guardar mensaje del usuario:", error);
        }

        const botResponse = new Message({
            sender: "Eliza",
            text: `Recibí tu mensaje: ${message}`,
        });

        try {
            await botResponse.save(); 
        } catch (error) {
            console.error("Error al guardar mensaje del bot:", error);
        }

        socket.emit("botResponse", botResponse);
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
