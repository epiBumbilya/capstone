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

router.get('/accountregistration/:username', (req, res) => {
    if(!req.session.user){
        res.redirect('/accountvalidator')
    }else{
        delete req.session.user
        res.render('registrationaccount',{
            value:req.params.username
        })
    }
})

module.exports = router