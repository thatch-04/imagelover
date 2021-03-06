///////////////////////////////
// Import Router
////////////////////////////////
const router = require("express").Router()
const bcrypt = require("bcryptjs")
const User = require("../models/User")

//check if user logged in, add req.user
const addUserToRequest = async (req, res, next) => {
    //check if the usrer is logged in
    if (req.session.userId){
        req.user = await User.findById(req.session.userId)
        next()
    } else {
        next()
    }
}

//checks if req.user exists, if not redirect to login
const isAuthorized = (req, res, next) => {
    if(req.user){
        next()
    } else {
        res.redirect("/auth/login")
    }

}

///////////////////////////////
// Router Specific Middleware
////////////////////////////////

router.use(addUserToRequest)
///////////////////////////////
// Router Routes
////////////////////////////////
router.get("/", (req, res) => {
    res.render("home")
})

//AUTH related routes

//sign up routes
router.get("/auth/signup", (req, res) => {
    res.render("auth/signup")
})

router.post("/auth/signup", async (req, res) => {
    try {
        //generate our salt
        const salt = await bcrypt.genSalt(10)
        //hash the password
        req.body.password = await bcrypt.hash(req.body.password, salt)
        console.log(req.body)
        //create the new user
        await User.create(req.body)
        //res.redirect to login
        res.redirect("/auth/login")
    } catch(error){
        res.json(error)
    }
})

//log in routes
//Login Routes
router.get("/auth/login", (req, res) => {
    res.render("auth/login")
})

router.post("/auth/login", async (req, res) => {
    try{
        //get the user
        const user = await User.findOne({username: req.body.username})
        if (user){
            //check if the passwords match
            const result = await bcrypt.compare(req.body.password, user.password)
            console.log(result)
            if (result){
                req.session.userId = user._id
                res.redirect("/images")
            } else {
                res.json({error: "User Doesn't Exist"})
            }
        } else {
            res.json({error: "User Doesn't Exist"})
        }
    } catch(error){
        res.json(error)
    }
})

//logout
router.get("/auth/logout", (req, res) => {
    //remove the userId property
    req.session.userId = null
    //redirect to main page
    res.redirect("/")
})

router.get("/images", isAuthorized, async (req, res) => {
    //pass req.user to our template
    res.render("images", {
        images: req.user.images
    })
})

// Image create route when form submitted
router.post("/images", isAuthorized, async (req, res) => {
    // fetch up to date user
    const user = await User.findOne({ username: req.user.username })
    // push new goal and save
    console.count()
    console.log(req.body.images)
    user.images.push({url: req.body.images})
    console.count()
    console.log(user.images)
    console.count()
    await user.save()
    // redirect back to goals index
    res.redirect("/images")
  })

///////////////////////////////
// Export Router
////////////////////////////////
module.exports = router