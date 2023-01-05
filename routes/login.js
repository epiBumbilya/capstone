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
    sweetalertsuccess = req.flash('sweetalertsuccess')
    InvalidNotif = req.flash('value')
    sweetalertsuccesss = req.flash('sweetalertsuccesss')
    approval = req.flash('approval')
    res.render('login',{
        sweetalertsuccess:InvalidNotif,
        sweetalertsuccess:sweetalertsuccess,
        sweetalertsuccess:approval 
    })  
})

module.exports = router