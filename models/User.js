//import model and Schema
const {Schema, model} = require("../db/connection")

//Set up image schema
const Image = new Schema({
    url: String
})

//Set up user schema
const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    images: [Image]
}, {timestamps: true})

const User = model("User", UserSchema)

module.exports = User
