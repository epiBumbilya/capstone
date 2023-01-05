const express = require('express')
const flash = require("connect-flash")
const cookie = require("cookie-parser")
const session = require("express-session")
const app = express()
const router = express.Router()

app.use(cookie('SecretStringForCookies'));
app.use(session({
    secret: "SecretStingForSession",
    cookie: {maxAge : 60000},
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

router.get('/', (req, res) => {
    username = req.flash("granted")
    error = req.flash('invalidusername')
    if (error == 'Username is taken'){
        res.render('StudentVehicleRegistration',{
            disabled: "disabled",
            hidden:"hidden",
            value:'',
            hiddenusername:"",
            errormessage:error,
            acceptmessage:"",
            message:""
        })
    }
    if(req.session.vehicleregistrationmessage == "accepted"){
        delete req.session.vehicleregistrationmessage
        res.render('StudentVehicleRegistration',{
            disabled: "disabled",
            hidden:"hidden",
            value:'',
            hiddenusername:"",
            errormessage:"",
            acceptmessage:"",
            message:"Successfully Registered"
        })
    }
    if(!req.session.vehicleregistration){
        res.render('StudentVehicleRegistration',{
            disabled: "disabled",
            hidden:"hidden",
            value:'',
            hiddenusername:"",
            errormessage:"",
            acceptmessage:"",
            message:""
        })
    }else{
        delete req.session.vehicleregistration
        res.render('StudentVehicleRegistration',{
            disabled: "",
            hidden:"",
            value:username,
            hiddenusername:'hidden',
            errormessage:"",
            acceptmessage:"Username Accepted",
            message:"",
        })
    }
})

module.exports = router