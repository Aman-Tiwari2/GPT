const mongoose = require('mongoose')


async function connectDB(){

    try{
        await mongoose.connect(process.env.MONGO_URI, 
            console.log("Database Connected Successfully")
        )
    }catch(error){
        console.log("Database Connected failed due to ", err)
    }
}

module.exports = connectDB;