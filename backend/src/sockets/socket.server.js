const { Server } = require('socket.io')
const aiService = require('../services/ai.service')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const cookie = require('cookie')
const messageModel = require('../models/message.model')




function initSocketServer(httpServer) {

    const io = new Server(httpServer, {})


    io.use(async (socket, next)=>{

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if(!cookies.token){
            next(new Error("Authentication error: No token provided"))
        }

        try{
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)

            const user = await userModel.findById(decoded.id)

            // if(!user){
            //     return next(new Error("Unautherized"))
            // }

            socket.user = user;

            next()

        }catch(error){
            next(new Error("Authentication error: Invalid token"))
        }

    })

    io.on('connection', (socket) => {


        socket.on("ai-message", async (rawPayload) => {


            try {
                // Handle both string and object payloads
                const messagePayload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;

                const content = messagePayload.content || messagePayload.input;

                if (!content) {
                    throw new Error("Message content is empty");
                }


                // User Ask messaged Store here

                await messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: messagePayload.content,
                    role:'user'
                })


                const chatHistory = await messageModel.find({
                    chat: messagePayload.chat
                })



                const response = await aiService.generateResponse(chatHistory.map(item => {
                    return {
                        role: item.role === 'model' ? 'assistant' : item.role,
                        content: item.content
                    }
                }));


                // Model Response message store here 

                await messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: response,
                    role:'model'
                })

                socket.emit('ai-response', {
                    content: response,
                    chat: messagePayload.chat
                });


            } catch (error) {

                socket.emit('ai-response', {
                    content: "Error generating response",
                    // chat: messagePayload.chat,
                    error: error.message
                });
            }
        })

    })
}

module.exports = initSocketServer 