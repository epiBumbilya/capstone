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
    username = req.flash("facultyvalid")
    error = req.flash("facultyinvalid")
  
    if (error == "Username is taken"){
        res.render('teacherandfaculty',{
            disabled: "disabled",
            hidden:"hidden",
            value:'',
            hiddenusername:"",
            errormessage: error ,
            acceptmessage:"",
            message:""
        })
    }

    if(req.session.facultymessage == "accepted"){
        delete req.session.facultymessage
        res.render('teacherandfaculty',{
            disabled: "disabled",
            hidden:"hidden",
            value:'',
            hiddenusername:"",
            errormessage:"",
            acceptmessage:"",
            message:"Successfully Registered"
        })
    }

    if(!req.session.faculty_username){
        res.render('teacherandfaculty',{
            disabled: "disabled",
            hidden:"hidden",
            value:'',
            hiddenusername:"",
            errormessage:"",
            acceptmessage:"",
            message:""
        })
    }else{
        delete req.session.faculty_username
        res.render('teacherandfaculty',{
            disabled: "",
            hidden:"",
            value:username,
            hiddenusername:"hidden",
            errormessage:"",
            acceptmessage:"Username Accepted",
            message:""
        })
    }
})

module.exports = router