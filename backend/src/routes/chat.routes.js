const express = require('express')
const authMiddleWare = require('../middlewares/auth.middleware')
const chatController = require('../controller/chat.controller')

const router = express.Router()


router.post('/', authMiddleWare.authUser, chatController.createChat)

module.exports = router