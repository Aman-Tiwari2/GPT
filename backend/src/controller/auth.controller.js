const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


async function registerUser(req, res){
    const { fullName: { firstName, lastName} , email, password} = req.body

    const isUserAlreadyExists = await userModel.findOne({ email })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User Already Exits"
        });
    }


    const hashPassword =  await bcrypt.hash(password, 10)

    const user = await userModel.create({
        fullName:{
            firstName, lastName
        },
        email,
        password: hashPassword,

    })


    const token = jwt.sign({ id : user._id}, process.env.JWT_SECRET )

    res.cookie("token", token)


    res.status(200).json({
        message:"User Registered Successfully",
        user:{
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}


async function loginUser(req, res){


    const { email, password } = req.body

    

    const user = await userModel.findOne({ email })

    if(!user){
        return res.status(400).json({
            message: "Invalid Email or password"
        })
    }


    const isPasswordValid = await bcrypt.compare( password , user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid Email or password"
        })
    }


    const token = jwt.sign({ id : user._id}, process.env.JWT_SECRET )

    res.cookie("token", token) 


    res.status(200).json({
        message:"User logged in successfully",
        user:{
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })


}

module.exports = { registerUser, loginUser }