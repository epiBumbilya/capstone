const express =require('express')
const bcrypt = require('bcrypt')
const res = require('express/lib/response')
const { status, json } = require('express/lib/response')
const path = require('path')
const app = express()
const database = require('./connectionDb/connectionDB');
const multer = require("multer")
const session = require("express-session")
const flash = require("connect-flash")
const cookie = require("cookie-parser")

const puppeteer = require('puppeteer');
const fs = require('fs');

const port = process.env.PORT || 3000
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static("Public"))

app.use(cookie('SecretStringForCookies'));
app.use(session({
    secret: "SecretStingForSession",
    cookie: {maxAge : 1000 * 60 * 60 * 24},
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

var sessionsignin = ""

const loginRoutes = require('./routes/login')
  app.use("/",loginRoutes)

const RegistrationVehicleVehicle = require('./routes/registervehicle')
  app.use("/registration",RegistrationVehicleVehicle)

const RegistrationAccount = require ('./routes/registrationaccount')
  app.use("/",RegistrationAccount)

const accountvalidator = require ("./routes/uservalidator")
  app.use("/accountvalidator",accountvalidator)

const admin = require ("./routes/admin")
  app.use("/",admin)
const carregistration = require("./routes/registervehicle")
  app.use("/Studentregistrationsheet",carregistration)
const facultyteacherreg = require("./routes/facultyteacherreg")
  app.use("/teacherfacultyregistrationsheet",facultyteacherreg)
const { localsName } = require('ejs')
const { query } = require('./connectionDb/connectionDB')
const { Console } = require('console')

app.get('/teacherlogin', (req, res) => {
  values = req.flash('values')
  res.render('teacherlogin',
  {
    invalidpassword:values,
    messages:''
  })
})
app.get('/visitorslog/:username', function (req, res) {
  const user = req.params.username
  var reset = ''
  const users = 'SELECT * FROM parkingsystem.visitorslog;'
  database.query(users,(err,reset)=>{
    if(err)
      console.log(err)
    else
      rset = reset
  })
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(err,rset)=>{
    if(err){
      console.log(err)
    }else{
      if(!req.session.usersignin){
        res.redirect("/")
    }else{
      const statuslevel = 'SuperAdmin'
      value = req.flash('data')
      disabled = req.flash('disabled')
      if(statuslevel.localeCompare(rset[0].status) == 0){
        res.render("vlogs",{
          username:rset[0].Username,
          fname:rset[0].user_account_fname,
          mname:rset[0].user_account_mname,
          lname:rset[0].user_account_lname,
          hidden:"",
          disabled:"",
          reset
        })
      }else{
        res.render("vlogs",{
          username:rset[0].Username,
          fname:rset[0].user_account_fname,
          mname:rset[0].user_account_mname,
          lname:rset[0].user_account_lname,
          hidden:"hidden",
          disabled:'',
          reset
        })
      }
    }
    }
  })
})
app.post('/loginbuttonforteacher', function (req, res) {
  const username = req.body.loginPassword
  const password = req.body.loginPassword
  const status = 'Pending'
  const sql = "Select * from parkingsystem.teacher_faculty_reg where Username = ?"
  database.query(sql,password,(error,results)=>{
    if(error)
      console.log(error)
    else  
      console.log(results)
      if(results.length==0){
        res.redirect('/teacherlogin')
      }else{

          const rawstatus = 'SELECT status from parkingsystem.teacher_faculty_reg where username = ?'
          database.query(rawstatus,username,async (err,rset)=>{
            if(err)
              console.log(err)
            else{
              const status = "Accept"
              const passwordcompare = await bcrypt.compare(password,results[0].password)
              if(passwordcompare){
                if(status.localeCompare(rset[0].status)==0){
                  sessionforstudent = req.session.sessionforteacher = username
                  res.redirect("/teacherupdatesheet/"+username)  
                }else{      
                  req.flash('values','approval')
                  res.redirect('/teacherlogin')
                }
              }  
              else{
                req.flash('values',"Invalid Passwords")
                res.redirect('/studentlogin')
              }
              
            }
          })

      }
  })
})
app.get('/teacherupdatesheet/:username',function (req,res){
  const username = req.params.username
  const select = "SELECT * FROM parkingsystem.teacher_faculty_reg where Username = ?"
  database.query(select,username,(err,rset)=>{
    if(err)
      console.log(err)
    else  
      res.render('teacherupdatesheet',{
        rset
      })
  })
})
app.post('/updatefacultyreg', function (req, res) {
    const fname = req.body.fname
    const mname = req.body.mname
    const lname = req.body.lname
    const gender = req.body.gender
    const usertypes = req.body.teacherfaculty
    const birthdate = req.body.birthdate
    const typevehicle = req.body.vehicledescription
    const barangay = req.body.barangay
    const municipality = req.body.municipality
    const province= req.body.province
    const phoneNumber = req.body.contact
    const platenumber = req.body.platenumber
    const username = req.body.username

    const sql = 'Update teacher_faculty_reg set fname= ?, mname = ?, lname = ? , gender = ?, birthdate = ?, vehicledescription = ? , barangay = ? , municipality = ? , province = ?, contact = ?, platenumber = ? ,usertypes = ? where Username = ?'
    database.query(sql,[fname,mname,lname,gender,birthdate,typevehicle,barangay,municipality,province,phoneNumber,platenumber,usertypes,username],(err,rset)=>{
      if(err)
        console.log(err)
      else
        res.redirect('/teacherupdatesheet/'+username)
    })
})
/*Post Here*/
app.post('/validateusername', function (req, res) {
  const username = req.body.registration_username
  const sql = "SELECT Username FROM parkingsystem.user_account where Username = ?"
  const query = database.query(sql,username,(err,rset)=>{
    if(err){
      console.log(err)
    }
    else{
      console.log(rset)
      
      if(rset == ""){
        req.session.user = username
        res.redirect('/accountregistration/'+username)
      }else if (rset != null){
        req.flash('invalidusername',"Username is taken")
        res.redirect("/accountvalidator")
      }
    }
  })
})
app.post('/validate-username', function (req, res){
  const username = req.body.vehicleregistration_username
  const sql = "SELECT username FROM parkingsystem.vehicletable where Username = ?"
  const query = database.query(sql,username,(err,rset)=>{
    if(err){
      console.log(err)
    }
    else{
      console.log(rset)
      if(rset == ""){
        req.session.vehicleregistration = username
        req.flash('granted', req.session.vehicleregistration)
        res.redirect('/Studentregistrationsheet')
      }else if (rset != null){
        req.flash('invalidusername',"Username is taken")
        res.redirect('/Studentregistrationsheet')
      }
    }
  })
})
app.post('/carregister', async (req, res) => {
  const today = new Date()
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()

  const days = "0"+day
  const addmonth = month + 1

  const joineddate = year+"-"+addmonth+"-"+days 
  console.log(joineddate)
  const hashpassword = await bcrypt.hash(req.body.vehicleregistration_password,10)
  const data = {
    username:                   req.body.vehicleregistration_username,
    password:                   hashpassword,
    vehicletable_fname:         req.body.vehicleregistration_firstname,
    vehicletable_mname:         req.body.vehicleregistration_middlename,
    vehicletable_lname:         req.body.vehicleregistration_lastname,
    studentid:                  req.body.vehicleregistration_studentid,
    year:                       req.body.vehicleregistration_year,
    major:                      req.body.vehicleregistration_major,
    section:                    req.body.vehicleregistration_section,
    gender:                     req.body.vehicleregistration_gender,
    vehicletable_birthdate:     req.body.vehicleregistration_birthdate,
    vehicletable_descript:      req.body.vehicleregistration_typevehicle,
    vehicletable_brgy:          req.body.vehicleregistration_barangay,
    vehicletable_muni:          req.body.vehicleregistration_municipality,
    vehicletable_prov:          req.body.vehicleregistration_province,
    vehicletable_cp:            req.body.vehicleregistration_phonenumber,
    vehicletable_platenumber:   req.body.vehicleregistration_platenumber,
    dateregister:               joineddate,
    status:                     "Pending"
  }
  const sql = "insert into vehicletable set ?"
  const query = database.query(sql,data,(err,rset)=>{
    if(err)
      console.log(err)
    else{
      req.session.vehicleregistrationmessage = "accepted"
      res.redirect("/Studentregistrationsheet")
    }
  })
})

app.post('/faculty-username', function (req, res) {
  const username = req.body.registration_username
  const sql = "Select Username from parkingsystem.teacher_faculty_reg where Username = ?"
  const query = database.query(sql,username,(err,rset)=>{
    if(err){
      console.log(err)
    }else{
      console.log(rset)
      if(rset == ""){
        req.session.faculty_username = username
        req.flash('facultyvalid',req.session.faculty_username)
        res.redirect("/teacherfacultyregistrationsheet")
      }else if (rset != null){
        req.flash('facultyinvalid','Username is taken')
        res.redirect("/teacherfacultyregistrationsheet")
      }
    }
  })
})

app.post('/teacher-faculty-reg', async (req, res) => {
  const today = new Date()
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 
  const hashpassword = await bcrypt.hash(req.body.registration_password,10)
  const data = {
    Username:                   req.body.registration_username,
    password:                   hashpassword,
    fname:                      req.body.registration_firstname,
    mname:                      req.body.registration_middlename,
    lname:                      req.body.registration_lastname,
    gender:                     req.body.registration_gender,
    birthdate:                  req.body.registration_birthdate,
    vehicledescription:         req.body.registration_typevehicle,
    barangay:                   req.body.registration_barangay,
    municipality:               req.body.registration_municipality,
    province:                   req.body.registration_province,
    contact:                    req.body.registration_phonenumber,
    platenumber:                req.body.platenumber,
    usertypes:                   req.body.teacherfaculty,
    dateregister:               joineddate,
    status:                     "Pending",
    InOutLogs:                  "Out"
  }
  const sql = "insert into teacher_faculty_reg set ?"
  const query = database.query(sql,data,(err,rset)=>{
    if(err)
      console.log(err)
    else
      req.session.facultymessage = "accepted"
      res.redirect("/teacherfacultyregistrationsheet")
  })


})
app.post('/signup', async (req, res)=> {
  const hashpassword = await bcrypt.hash(req.body.registration_password,10)
  console.log(hashpassword)
  const Username = req.body.registration_username
  console.log("Username "+Username)
  var resultforsqlforlastrow = ""
  const data ={
    Username: req.body.registration_username,
    password: hashpassword
  }

  const sql = "insert into user_account set ?"
  const query = database.query(sql,data,(err,rset)=>{
    if(err){
      console.log(err)
    }else{
      const dataforaccountinfo ={
        /*accountinfo*/
        Username:               Username,
        user_account_fname:     req.body.registration_firstname,
        user_account_lname:     req.body.registration_lastname,
        user_account_mname:     req.body.registration_middlename,
        birthdate:              req.body.registration_birthdate,
        gender:                 req.body.registration_gender,
        barangay:               req.body.registration_barangay,
        city:                   req.body.registration_municipality,
        province:               req.body.registration_province,
        contact_number:         req.body.registration_phonenumber,
        contact_email:          req.body.registration_email,   
        status:                 "semi-admin",
        statusaccept:           "Pending"
      }
      const sqlforaccountinfo = "insert into user_account_info set ?"
      const queryforaccountinfo = database.query(sqlforaccountinfo,dataforaccountinfo,(err,rset)=>{
        if(err){
          console.log(err)
        }else{
          delete req.session.user
          const sweetalertsuccess = 'Successfully Registered'
          req.flash('sweetalertsuccess',sweetalertsuccess)
          res.redirect('/')
        }
      })
    }
  })
})

app.post('/signin', function (req, res) {
  const username = req.body.login_username
  const password = req.body.login_password
  const statusaccept = "Accept"
  const sql = "SELECT * FROM parkingsystem.user_account where Username = ?"
  const query = database.query(sql,username, async(err,rset)=>{
    if(err){
      console.log(err)
    }else{
      if(rset.length == 0){
        res.redirect("/")
      }else{
        const passwordcompare = await bcrypt.compare(password,rset[0].password)
        if (passwordcompare){
          const sqlforstatus = "select statusaccept from parkingsystem.user_account_info where Username = ?"
          const queryforstatus = database.query(sqlforstatus,username,(err,rsetforsqlforstatus)=>{
            if(err){
              console.log(err)
            }else{
              if(statusaccept.localeCompare(rsetforsqlforstatus[0].statusaccept) == 0){
                sessionsignin = req.session.usersignin = username
                res.redirect("/admin/"+username)
              }else{
                req.flash('approval',"approval")
                res.redirect("/")
              }
            }
          })
        }else{
          req.flash('value',"Invalid Password")
          res.redirect("/")
        }
      }
    }
  })

})
app.post('/delete/:id/:username', (req, res) => {
  const id = req.params.id
  const username = req.params.username
  const sql = "Delete FROM parkingsystem.vehicletable where id = ?;"
  const query = database.query(sql,[id],(err,rset)=>{
    if(err)
      console.log(err)
    else{
      if(!req.session.usersignin){
        res.redirect("/")
      }else{
        res.redirect('/approve/'+username)  
      } 
    }
  })
})

app.get('/edit/:id/:username',(req,res)=>{
  const id = req.params.id
  const username = req.params.username
  const sql = 'Update vehicletable set LogsInOut = "Out" , status = "Accept" where  id = ?;'
  let query = database.query(sql, [id], (err,rset)=>{
      if(err)
          console.log(err)
      else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          res.redirect('/approve/'+username)  
        }   
  })
})
app.post('/teacherout/:id/:adminusername/:idparkingslots/:vdesc', function (req, res) {
  const id = req.params.id
  const admin = req.params.adminusername
  const idparkingslots = req.params.idparkingslots
  const vdesc = req.params.vdesc

  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat

  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 

  const logsInOut = "Out"
  const outverifyier ='SELECT InOutLogs from parkingsystem.teacher_faculty_reg where regisrationid = ?;'
  database.query(outverifyier,id,(errorou,resultin)=>{
    if(errorou)
      console.log(errorou)
    else{
      console.log(resultin)
      if(logsInOut.localeCompare(resultin[0].InOutLogs) == 0){
          req.flash('inmessage',"alreadylogout")
          req.flash('plateno')
          res.redirect("/teacherfacultylogs/"+admin+"/"+vdesc)
      }else{
          const sqlselectuser = 'SELECT * FROM parkingsystem.teacher_faculty_reg where regisrationid = ?;'
          database.query(sqlselectuser,id,(error,result)=>{
            if(error)
              console.log(error)
            else{
              const sql = "update parkingsystem.teacher_faculty_reg set  Logstimeout = ' ' , InOutLogs = ? ,Logsdate=? where regisrationid = ?"
              const query = database.query(sql,[logsInOut,joineddate,id],(err,rset)=>{
                if(err)
                  console.log(err)
                else{
                  const archivedata = {
                    rid:result[0].regisrationid,
                    fullname:result[0].fname+" "+result[0].mname+" "+result[0].lname,
                    address:result[0].barangay+" "+result[0].municipality+" "+result[0].province,
                    gender:result[0].gender,
                    contactno:result[0].contact,
                    vdescript:result[0].vehicledescription,
                    timein:result[0].Logstime,
                    timeout:logs,
                    date:result[0].Logsdate,
                    plateno:result[0].platenumber,
                    pslots:result[0].pslots
                  }

                  const insertsql = 'insert into parkingsystem.parkedarchiveteacher set ?'
                  database.query(insertsql,archivedata,(errsql,rsetsql)=>{
                    if(errsql)
                      console.log(errsql)
                    else
                      database.query(`update parkingsystem.parkingslots set useroccupied ='',status='Out' where idparkingslots = ?`,idparkingslots,(e,r)=>{
                        if(e)
                          console.log(e)
                        else
                          req.flash('inmessage',"out")
                          req.flash('plateno')
                          res.redirect("/teacherfacultylogs/"+admin+'/'+vdesc)
                      })
                  })
                }
              })
            }
          })
      }
    }
  })
})
/*InTeacher*/
app.get('/teacherin/:regisrationid/:username/:vehicledescription/:plateno/:parkingslot', function (req, res) {
  const id = req.params.regisrationid
  const parkingslot = req.params.parkingslot
  const admin = req.params.username
  const platenumber = req.params.plateno
  const vehicledescriptions = req.params.vehicledescription
  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+ day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat
  const logsInOut = "In"
  console.log("working")
  if(vehicledescriptions == "Motorcyle"){
    database.query(`Select count(idparkingslots) `+
                   `as Parked from parkingslots `+
                   `where description = 'Motorcyle' `+
                   `and users = 'TeacherStaff'`,(err,rset)=>{
                    if(err)
                      console.log(err)
                    else
                      if(rset[0].Parked != 0){
                        database.query(`SELECT pakingnumber,idparkingslots FROM parkingsystem.parkingslots  where idparkingslots = ?;`,parkingslot,(error1,result1)=>{
                          if(error1)
                            console.log(error1)
                          else
                            database.query(`update parkingsystem.teacher_faculty_reg set pslots= ? ,idparkingslots = ? , Logstime = ? , InOutLogs = ?, Logsdate = ? where regisrationid = ? `
                            ,[result1[0].pakingnumber,result1[0].idparkingslots,logs,logsInOut,joineddate,id],(error2,result2)=>{
                              if(error1)
                                console.log(error2)
                              else
                                database.query(`update parkingsystem.parkingslots set useroccupied = ?, status = 'In' where idparkingslots = ?`,[platenumber,parkingslot],(error3,result3)=>{
                                  if(error3)
                                    console.log(error3)
                                  else
                                    req.flash('inmessage',"In")
                                    req.flash('plateno',platenumber)
                                    res.redirect("/teacherfacultylogs/"+admin+'/'+vehicledescriptions)
                                })
                            })
                        })
                      }
                   })
  }else{
      database.query(`Select count(idparkingslots) `+
      `as Parked from parkingslots `+
      `where description = 'FourWheeledVehicle' `+
      `and users = 'TeacherStaff'`,(err,rset)=>{
      if(err)
        console.log(err)
      else
        if(rset[0].Parked != 0){
          database.query(`SELECT pakingnumber,idparkingslots FROM parkingsystem.parkingslots  where idparkingslots = ?;`,parkingslot,(error1,result1)=>{
            if(error1)
              console.log(error1)
            else
              database.query(`update parkingsystem.teacher_faculty_reg set pslots= ? ,idparkingslots = ? , Logstime = ? , InOutLogs = ?, Logsdate = ? where regisrationid = ? `
              ,[result1[0].pakingnumber,result1[0].idparkingslots,logs,logsInOut,joineddate,id],(error2,result2)=>{
                if(error1)
                  console.log(error2)
                else
                  database.query(`update parkingsystem.parkingslots set useroccupied = ?, status = 'In' where idparkingslots = ?`,[platenumber,parkingslot],(error3,result3)=>{
                    if(error3)
                      console.log(error3)
                    else
                      req.flash('inmessage',"In")
                      req.flash('plateno',platenumber)
                      res.redirect("/teacherfacultylogs/"+admin+'/'+vehicledescriptions)
                  })
              })
          })
        }
      })
  }


  
})
/*end*/
app.post('/outsss/:studentid/:adminusername', function (req, res) {
  const id = req.params.studentid
  const admin = req.params.adminusername
  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat

  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 

  const logsInOut = "Out"

  const sql = "update vehicletable set logs = ? , LogsInOut = ? ,logsdate = ? where id = ?"
  const query = database.query(sql,[logs,logsInOut,joineddate,id],(err,rset)=>{
    if(err)
      console.log(err)
    else{
      const sqlvalidation = "Select vehicletable_platenumber from vehicletable where id = ?"
      const queryvalidation = database.query(sqlvalidation,id,(errr,rsets)=>{
        req.flash('Needtoout',"SuccesfullyOut")
        req.flash("platenumber",rsets[0].vehicletable_platenumber)
        res.redirect("/invehicle/"+admin)
      })
    }
  })
})

app.get('/Studentupdateprofile/:username', (req, res) => {
  const username = req.params.username
  const sql = "select * from vehicletable where username = ?"
  const query = database.query(sql,username,(err,rset)=>{
    if(err)
      console.log(err)
    else{
      if (!req.session.sessionforstudent){
        res.redirect("/Studentregistrationsheet")
      }else{
        res.render('studentupdate',{
          rset
        })
      }
    }
  })
})

app.post('/updatestudent', function (req, res) {
  const username = req.body.UpdateStudentUsername
  const password = req.body.UpdateStudentPassword
  const status = "Accept"
  const sql = "Select * from parkingsystem.vehicletable where username = ?"
  const query = database.query(sql,username, async (err,rset)=>{
    if(err)
      console.log(err)
    else
      if(rset.length==0){
        res.redirect('/studentlogin')
      }else{
        const sqlvalidation = 'SELECT status from parkingsystem.vehicletable where username = ?;'
        database.query(sqlvalidation,username, async (errr,rsets)=>{
          if (err)
            console.log(errr)
          else{
            const passwordcompare = await bcrypt.compare(password,rset[0].password)
            if(passwordcompare){
              if(status.localeCompare(rsets[0].status)==0){
                sessionforstudent = req.session.sessionforstudent = username
                res.redirect("/Studentupdateprofile/"+username)  
              }else{
                req.flash('messages','approval')
                res.redirect('/studentlogin')
              }
            }
            else{
              req.flash('value',"Invalid Passwords")
              res.redirect('/studentlogin')
            }
            }

        })
      }
  })
})

app.get('/studentlogin',(req,res)=>{
  InvalidNotif = req.flash('value')
  messages = req.flash('messages')
  classes = req.flash('class')
  res.render('Studentlogin',{
    invalidpassword:InvalidNotif,
    messages:messages
    
    
  })
})
app.post('/updatestudentcredentials/:username', function (req, res) {
  const username = req.params.username
  const studentid = req.body.updatestudentid
  const major = req.body.updatemajor
  const year = req.body.updateyear
  const section = req.body.updatesection
  const fname = req.body.updatefirstname
  const mname = req.body.updatemiddlename
  const lname = req.body.updatelastname
  const gender = req.body.updategender
  const birthdate = req.body.updatebirthdate
  const typevehicle = req.body.updatetypevehicle
  const barangay = req.body.updatebarangay
  const municipality = req.body.updatemunicipality
  const province = req.body.updateprovince
  const phonenumber = req.body.updatephonenumber
  const platenumber = req.body.updateplatenumber

  const sql = "Update vehicletable set studentid = ?, major = ?, year = ? , section = ?, vehicletable_fname = ?, vehicletable_mname = ? ,  vehicletable_lname = ? , gender = ? , vehicletable_birthdate = ?, vehicletable_descript = ?, vehicletable_brgy = ? , vehicletable_muni = ? , vehicletable_prov = ?, vehicletable_cp = ? , vehicletable_platenumber = ? where username = ?"
  const query = database.query(sql,[studentid,major,year,section,fname,mname,lname,gender,birthdate,typevehicle,barangay,municipality,province,phonenumber,platenumber,username],(err,rset)=>{
                                if(err)
                                  console.log(err)
                                else
                                  res.redirect('/Studentupdateprofile/'+username)
                              })
})
app.post('/adminupdate/:username', function (req, res) {
  const username = req.params.username
  const fname = req.body.editfirstname
  const mname = req.body.editmiddlename
  const lname = req.body.editlastnmae
  const bday = req.body.editbirthdate
  const gender = req.body.editgender
  const brgy = req.body.editbarangay
  const municipality = req.body.editmunicipality
  const prov = req.body.editprovince
  const email = req.body.editemail
  const contactno= req.body.editcontact
  const sql = "update user_account_info set user_account_fname = ? , user_account_lname = ? , user_account_mname = ? , birthdate = ? , gender = ? , barangay = ? , city = ? , province = ? , contact_number = ? , contact_email = ? where Username = ?"
  const query = database.query(sql,[fname,lname,mname,bday,gender,brgy,municipality,prov,contactno,email,username],(err,rset)=>{
    if(err)
      console.log(err)
    else
      req.flash("successfuly","successfuly")
      res.redirect('/adminedit/'+username)
  })
})
app.post('/updateparkingspace/:username/:parkingid', function (req, res) {
  const username = req.params.username
  const parkingid = req.params.parkingid
  const pakingquantity = req.body.space
  const sql = "Update parkingsystem.pakingspace set space = ? where ParkingId = ?"
  const query = database.query(sql,[pakingquantity,parkingid],(err,rset)=>{
    if(err)
      console.log(err)
    else
      res.redirect("/parkingspace/"+username)
  })
})
app.post('/insertvisitors/:admin', function (req, res) {
  const username = req.params.admin
  const status = "In"
  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat

  database.query(`SELECT pakingnumber FROM parkingsystem.parkingslots where idparkingslots = ?;`,req.body.parkingspace,(err,resultss)=>{
    if(err)
      console.log(err)
    else{
      const dataforaccountinfo ={
        pslots:resultss[0].pakingnumber,
        fname:req.body.visitorsfirstname,
        mname:req.body.visitorsmiddlename,
        lname:req.body.visitorslastnmae,
        purpose:req.body.visitorspurpose,
        gender:req.body.visitorsgender,
        barangay:req.body.visitorsbarangay,
        city:req.body.visitorsmunicipality,
        province:req.body.visitorsprovince,
        contactno:req.body.visitorscontact,
        status:status,
        tin:logs,
        date:joineddate,
        idpslots:req.body.parkingspace,
        platenumber:req.body.visitorspnumber
      }
    
      const sql = "insert into parkingsystem.visitorslog set ?"
      database.query(sql,dataforaccountinfo,(err,rset)=>{
        if(err)
          console.log(err)
        else

          database.query(`update parkingsystem.parkingslots set  useroccupied = ? , status = 'In' where idparkingslots = ?`,[req.body.visitorspnumber,req.body.parkingspace],(error,result)=>{
            if(error)
              console.log(error)
            else
            req.flash('fullname',req.body.visitorsfirstname+' '+req.body.visitorsmiddlename+' '+req.body.visitorslastnmae)
            req.flash('purpose',req.body.visitorspurpose)
            res.redirect('/visitors/'+username)
          })
      })
    }
  })

})


//student button
app.get('/deletestudent/:id/:adminusername', function (req, res) { //delete for student
  const id = req.params.id
  const sql = "delete from vehicletable where id = ?;"
  database.query(sql,id,(err,rset)=>{
    if(err)
      console.log(err)
    else
      req.flash('messagestudent','Succesfullydelete')
      res.redirect('/approve/'+req.params.adminusername)
  })
})
app.get('/pendinguser/:id/:adminusername', (req, res) => {
  const id = req.params.id
  const username = req.params.adminusername
  var status = 'Pending'
  const sql = 'Update vehicletable set status = ? where  id = ?;'
  let query = database.query(sql, [status,id], (err,rset)=>{
      if(err)
          console.log(err)
      else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          req.flash('messagestudent','Succesfullypending')
          res.redirect('/approve/'+username)  
        }   
  })
})
app.get('/edit/:id/:username',(req,res)=>{
  const id = req.params.id
  const username = req.params.username
  var status = "Accept"
  const sql = 'Update vehicletable set status = ? where  id = ?;'
  let query = database.query(sql, [status,id], (err,rset)=>{
      if(err)
          console.log(err)
      else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          req.flash('messagestudent','Succesfullyapprove')
          res.redirect('/approve/'+username)  
        }   
  })
})
app.get('/resetpassword/:id/:admin',async (req, res) => {
  const id = req.params.id
  const admin = req.params.admin
  const password = await bcrypt.hash("123456789",10)
  const sql ='Update vehicletable set password = ? where id = ?;'
  database.query(sql,[password,id],(err,rset)=>{
    if (err)
      console.log(err)
    else  
      if(!req.session.usersignin){
        res.redirect("/")
      }else{
        req.flash('messagestudent','Succesfullyreset')
        res.redirect('/approve/'+admin)  
      } 
  })
})

app.get('/in/:studentid/:adminusername/:vehicledescriptiom/:plateno/:parkingslot', function (req, res) {
  const id = req.params.studentid
  const admin = req.params.adminusername
  const slot = req.params.parkingslot
  const pnumber = req.params.plateno
  var typeofvehicle = "" 
  const vehicledescription = req.params.vehicledescriptiom 
  console.log(vehicledescription)
  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat
  const logsInOut = "In"

  if(vehicledescription == "Motorcyle"){
    const totalin = "select count(username) as totalin from vehicletable where vehicletable_descript = 'Motorcyle' and LogsInOut = 'In' and status = 'Accept'"
    database.query(totalin,(err,rsets)=>{
      if (err)
        console.log(err)
      else{
        const sqlforspace = "select count(description) as Motor from parkingslots where status = 'Out' and  users = 'Student' and description = ?"
        database.query(sqlforspace,vehicledescription,(err,rsetss)=>{
          if(err)
            console.log(err)
          else{
            if(rsetss[0].Motor > 0){
              const find = 'SELECT * FROM parkingsystem.vehicletable where id = ?;'
              database.query(find,id,(err,rsetfind)=>{
                if (err)
                  console.log(err)
                else{
                  database.query(`update parkingsystem.parkingslots set  useroccupied = ? , status = 'In' where idparkingslots = ?`,
                  [pnumber,slot],(error,resultss)=>{
                    if(error)
                      console.log(error)
                    else{
                      database.query(`select pakingnumber,idparkingslots from parkingslots where idparkingslots = ?`,slot,(errror,resault)=>{
                        if(errror)
                          console.log(errror)
                        else{
                          const vehiclein = "Update vehicletable set logs = ? ,idparkingslot = ? , parkingslot = ?, LogsInOut = 'In' where id = ?"
                          database.query(vehiclein,[logs,resault[0].idparkingslots,resault[0].pakingnumber,id],(err,rsetsin)=>{
                            if (err)
                              console.log(err)
                            else{
                              req.flash("platenumber",req.params.plateno)
                              req.flash('Needtoout',"Succesfullyin")
                              res.redirect("/invehicle/"+admin+'/'+vehicledescription)
                            }
                          })
                        }
                      })
                    }                     
                  })
                }
              })
            }else{
              req.flash('Needtoout',"Full")
              res.redirect("/invehicle/"+admin+'/'+vehicledescription)
            }
          }
        })
      }
    })
    
  }else{
    const totalin = "select count(username) as totalin from vehicletable where vehicletable_descript = 'Four Wheeled Vehicle' and LogsInOut = 'In' and status = 'Accept'"
    database.query(totalin,(err,rsets)=>{
      if(err)
        console.log(err)
      else{
        const sqlforspace = "select count(description) as fourwheel from parkingslots where status = 'Out' and users = 'Student' and description = 'Four Wheeled Vehicle'"
        database.query(sqlforspace,(err,rsetss)=>{
          if(err)
            console.log(err)
          else{
            if(rsetss[0].fourwheel > 0){
              const find = 'SELECT * FROM parkingsystem.vehicletable where id = ?;'
              database.query(find,id,(err,rsetfind)=>{
                if (err)
                  console.log(err)
                else{
                  database.query(`update parkingsystem.parkingslots set  useroccupied = ? , status = 'In' where idparkingslots = ?`,
                  [pnumber,slot],(error,resultss)=>{
                    if(error)
                      console.log(error)
                    else{
                      database.query(`select pakingnumber,idparkingslots from parkingslots where idparkingslots = ?`,slot,(errror,resault)=>{
                        if(errror)
                          console.log(errror)
                        else{
                          const vehiclein = "Update vehicletable set logs = ? ,idparkingslot = ?,parkingslot = ?, LogsInOut = 'In' where id = ?"
                          database.query(vehiclein,[logs,resault[0].idparkingslots,resault[0].pakingnumber,id],(err,rsetsin)=>{
                            if (err)
                              console.log(err)
                            else{
                              req.flash("platenumber",req.params.plateno)
                              req.flash('Needtoout',"Succesfullyin")
                              res.redirect("/invehicle/"+admin+'/'+vehicledescription)
                            }
                          })
                        }
                      })
                    }                     
                  })
                }
              })
            }else{
              req.flash('Needtoout',"Full")
              res.redirect("/invehicle/"+admin+'/'+vehicledescription)
              console.log("madi")
              console.log(rsets[0].totalin)
              console.log(rsetss[0].space)
            }
          }
        })
      }
    })

  }
})

app.post('/out/:studentid/:adminusername/:vdes/:idparkingslot', function (req, res) {
  const id = req.params.studentid
  const admin = req.params.adminusername
  const vdesc = req.params.vdes
  const idparkingslot = req.params.idparkingslot
  console.log(req.params.idparkingslot)

  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat

  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 
  const outverifyier = 'Out'
  const sqlouts = 'SELECT LogsInOut FROM parkingsystem.vehicletable where id = ?;'
  database.query(sqlouts,id,(errorout,resultin)=>{
    if(errorout)
      console.log(errorout)
    else
      if(outverifyier.localeCompare(resultin[0].LogsInOut) == 0){
        req.flash('Needtoout',"alreadylogout")
        res.redirect("/invehicle/"+admin+"/"+vdesc)
      }else{
          const sqlselectstudent = 'SELECT * FROM parkingsystem.vehicletable where id = ? ;'
            database.query(sqlselectstudent,id,(err,rsets)=>{
              if(err)
                console.log(err)
              else{
                const sql = "update parkingsystem.vehicletable set timeout = ? , LogsInOut = 'Out' ,logsdate = ? where id = ?"
                database.query(sql,[logs,joineddate,id],(err,rset)=>{
                  if(err)
                    console.log(err)
                  else{
                    database.query(`update parkingsystem.parkingslots set useroccupied = '' , status = 'Out' where idparkingslots = ?`,idparkingslot,(error,result)=>{
                      if (error)
                        console.log(error)
                      else{
                        const archivedata = {
                          sid:rsets[0].id,
                          fullname:rsets[0].vehicletable_fname+" "+rsets[0].vehicletable_mname+" "+rsets[0].vehicletable_lname,
                          address:rsets[0].vehicletable_brgy+" "+rsets[0].vehicletable_muni+" "+rsets[0].vehicletable_prov,
                          section:rsets[0].major+"-"+rsets[0].year+"-"+rsets[0].section,
                          vdescript:rsets[0].vehicletable_descript,
                          plateno:rsets[0].vehicletable_platenumber,
                          logouttime:logs,
                          logintime:rsets[0].logs,
                          date:joineddate,
                          pslot:rsets[0].parkingslot
                        }
                        const sql = "insert into parkedarchive set ?"
                        const query = database.query(sql,archivedata,(err,rsetsss)=>{
                          if(err)
                            console.log(err)
                          else{
                            database.query(`update parkingsystem.vehicletable set parkingslot = ''where id = ?`,id,(errupdate,resultupdate)=>{
                              if (errupdate){
                                console.log(errupdate)
                              }else{
                                req.flash('Needtoout',"SuccesfullyOut")
                                req.flash("platenumber",rsets[0].vehicletable_platenumber)
                                res.redirect("/invehicle/"+admin+'/'+rsets[0].vehicletable_descript)
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
      }
  })
})

/*End Here*/

//faculty button
app.get('/editfaculty/:id/:username', function (req, res) {
  const id = req.params.id
  const username = req.params.username
  var status = "Accept"
  const sql = 'Update parkingsystem.teacher_faculty_reg set status = ? where  Username = ?;'
  let query = database.query(sql, [status,id], (err,rset)=>{
      if(err)
          console.log(err)
      else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          res.redirect('/faculty/'+username)  
        }   
  })
})
app.get('/pendinguserteacher/:id/:username', function (req, res) {
  const id = req.params.id
  const username = req.params.username
  var status = "Pending"
  const sql = 'Update parkingsystem.teacher_faculty_reg set status = ? where  Username = ?;'
  let query = database.query(sql, [status,id], (err,rset)=>{
      if(err)
          console.log(err)
      else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          res.redirect('/faculty/'+username)  
        }   
  })
})
app.get('/reset/:id/:username', async (req, res) => {
  const id = req.params.id
  const username = req.params.username
  const password = await bcrypt.hash("123456789",10)
  const sql = 'Update parkingsystem.teacher_faculty_reg set password = ? where Username = ?'
  database.query(sql,[password,id],(err,rset)=>{
    if(err)
          console.log(err)
    else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          res.redirect('/faculty/'+username)  
        }
  })
})
app.get('/deletefaculty/:id/:username', function (req, res) {
  const id = req.params.id
  const username =req.params.username
  const sql = "Delete from parkingsystem.teacher_faculty_reg where Username = ?;"
  const query = database.query(sql,[id],(err,rset)=>{
    if(err)
      console.log(err)
    else{
      if(!req.session.usersignin){
        res.redirect("/")
      }else{
        res.redirect('/faculty/'+username)  
      }
    }
  })
})
//endhere

//adminlist
app.get('/deleteadmin/:username/:adminusername', (req, res) => {
  const username = req.params.username
  const adminusername = req.params.adminusername
  const sql = 'delete from user_account_info where Username = ?'
  database.query(sql,username,(err,rset)=>{
    if(err)
    console.log(err)
    else{
      if(!req.session.usersignin){
        res.redirect("/")
      }else{
        req.flash("adminlistmessage","Delete")
        res.redirect('/adminlist/'+adminusername)  
      }
    }
  })
})
app.get('/aproveadmin/:username/:adminusername', (req, res) => {
  const username = req.params.username
  const adminusername = req.params.adminusername
  const sql = "Update parkingsystem.user_account_info set statusaccept = 'Accept' where  Username = ?;"
  database.query(sql,username,(err,rset)=>{
    if (err)
      console.log(err)
    else  
    if(!req.session.usersignin){
      res.redirect("/")
    }else{
      req.flash("adminlistmessage","Approve")
      res.redirect('/adminlist/'+adminusername)  
    }
  })
})
app.get('/pendingadmin/:username/:adminusername', (req, res) => {
  const username = req.params.username
  const adminusername = req.params.adminusername
  const sql = "Update parkingsystem.user_account_info set statusaccept = 'Pending' where  Username = ?;"
  database.query(sql,username,(err,rset)=>{
    if (err)
      console.log(err)
    else  
    if(!req.session.usersignin){
      res.redirect("/")
    }else{
      req.flash("adminlistmessage","Pending")
      res.redirect('/adminlist/'+adminusername)  
    }
  })
})
app.get('/resetpass/:username/:adminusername', async (req, res) => {
  const id = req.params.username
  const username = req.params.adminusername
  const password = await bcrypt.hash("123456789",10)
  const sql = 'Update user_account set password = ? where Username = ?'
  database.query(sql,[password,id],(err,rset)=>{
    if(err)
          console.log(err)
    else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          res.redirect('/adminlist/'+username)  
        }
  })
})

app.get('/adminsuper/:username/:adminusername', async (req, res) => {
  const id = req.params.username
  const username = req.params.adminusername 
  const sql = 'Update parkingsystem.user_account_info set status = "SuperAdmin" where Username = ?'
  database.query(sql,id,(err,rset)=>{
    if(err)
          console.log(err)
    else
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          res.redirect('/adminlist/'+username)  
        }
  })
})
//endhere

app.get('/faculty/:user', (req, res) => {
  const user = req.params.user
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(erruser,rsetuser)=>{
    if(erruser)
      console.log(erruser)
    else{
      const sql = "SELECT * FROM parkingsystem.teacher_faculty_reg"
      const query = database.query(sql,(err,rset)=>{
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          if(err)
            console.log(err)
          else{
            const statuslevel = 'SuperAdmin'
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
            res.render('Admin_TeacherandFacultyVehicle',{
              rset,
              username:rsetuser[0].Username,
              fname:rsetuser[0].user_account_fname,
              lname:rsetuser[0].user_account_lname,
              mname:rsetuser[0].user_account_mname,
              hidden:""
            })
          }else{
            res.render('Admin_TeacherandFacultyVehicle',{
              rset,
              username:rsetuser[0].Username,
              fname:rsetuser[0].user_account_fname,
              lname:rsetuser[0].user_account_lname,
              mname:rsetuser[0].user_account_mname,
              hidden:"hidden"
            })
          }
          }
        }  
      })
    }
  })
})
app.get('/parkingspace/:user', (req, res) => {
  const user = req.params.user
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(erruser,rsetuser)=>{
    if(erruser)
      console.log(erruser)
    else{
      const sql ="SELECT * FROM parkingsystem.pakingspace;"
      const query = database.query(sql,(err,rset)=>{
        if(err)
          console.log(err)
        else{
          if(!req.session.usersignin){
            res.redirect("/")
          }else{
              const statuslevel = 'SuperAdmin'
              if(statuslevel.localeCompare(rsetuser[0].status) == 0){
                res.render('Admin_Editparkingspace',{
                  rset,
                  username:rsetuser[0].Username,
                  fname:rsetuser[0].user_account_fname,
                  lname:rsetuser[0].user_account_lname,
                  mname:rsetuser[0].user_account_mname,
                  hidden:""
                })
              }else{
                res.render('Admin_Editparkingspace',{
                  rset,
                  username:rsetuser[0].Username,
                  fname:rsetuser[0].user_account_fname,
                  lname:rsetuser[0].user_account_lname,
                  mname:rsetuser[0].user_account_mname,
                  hidden:"hidden"
                })
              }
          } 
        }
      }) 
    }
  })
})
app.get('/approve/:user', (req, res) => {
  const user = req.params.user
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(erruser,rsetuser)=>{
    if(erruser)
      console.log(erruser)
    else{
      const sql = "SELECT * FROM parkingsystem.vehicletable;"
      const query = database.query(sql,(err,rset)=>{
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          if(err)
            console.log(err)
          else{
            const statuslevel = 'SuperAdmin'
            message = req.flash('messagestudent')
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
              res.render('Admin_StudentVehicle',{
                rset,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                hidden:"",
                alertforstudent:message
             })
            }else{
              res.render('Admin_StudentVehicle',{
                rset,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                hidden:"",
                alertforstudent:message
             })
            }
          }
        }  
  })
    }
  })
})
app.get('/Archive/:adminusername', (req, res) => {
  const admin = req.params.adminusername
  const adminquery = "select * from parkingsystem.user_account_info where Username = ?"
  database.query(adminquery,admin,(err,rsetuser)=>{
    if(err)
      console.log(err)
    else{
      const rawdata = "SELECT * FROM parkedarchive where vdescript = 'Motorcyle' order by date desc;"
    database.query(rawdata,(err,rset)=>{
      if(!req.session.usersignin){
        res.redirect("/")
      }else{
        if(err)
          console.log(err)
        else{
          const statuslevel = 'SuperAdmin'
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
            res.render('Admin_StudentArchive',{
              rset,
              username:rsetuser[0].Username,
              fname:rsetuser[0].user_account_fname,
              lname:rsetuser[0].user_account_lname,
              mname:rsetuser[0].user_account_mname,
              hidden:""
            })
          }else{
            res.render('Admin_StudentArchive',{
              rset,
              username:rsetuser[0].Username,
              fname:rsetuser[0].user_account_fname,
              lname:rsetuser[0].user_account_lname,
              mname:rsetuser[0].user_account_mname,
              hidden:"hidden"
            })
          }
        }
          
      }
        
      
    })
    }
        
  })
})
app.get('/adminarchive/:adminusername', (req, res) => {
  const admin = req.params.adminusername
  const adminquery = "select * from parkingsystem.user_account_info where Username = ?"
  database.query(adminquery,admin,(err,rsetuser)=>{
    if(err)
      console.log(err)
    else{
      const rawdata = "SELECT * FROM parkingsystem.parkedarchiveteacher order by archiveid desc;"
    database.query(rawdata,(err,rset)=>{
      if(!req.session.usersignin){
        res.redirect("/")
      }else{
        if(err)
          console.log(err)
        else{
          const statuslevel = 'SuperAdmin'
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
            res.render('adminfacultyarchive',{
              rset,
              username:rsetuser[0].Username,
              fname:rsetuser[0].user_account_fname,
              lname:rsetuser[0].user_account_lname,
              mname:rsetuser[0].user_account_mname,
              hidden:""
            })
          }else{
            res.render('adminfacultyarchive',{
              rset,
              username:rsetuser[0].Username,
              fname:rsetuser[0].user_account_fname,
              lname:rsetuser[0].user_account_lname,
              mname:rsetuser[0].user_account_mname,
              hidden:"hidden"
            })
          }
        }
          
      }
        
      
    })
    }
        
  })
})
app.get('/teacherfacultylogs/:user/:vdes', (req, res) => {
  const user = req.params.user
  const vehicle = req.params.vdes
  var vehicleresultss = req.params.vdes 

  var vehicleresults = ''

  database.query(`SELECT * FROM parkingsystem.parkingslots where status = 'Out' and users = 'TeacherStaff' and Description = ? `,vehicle,(errors,results)=>{
    if (errors)
      console.log(errors)
    else
      vehicleresults = results
  })
  database.query(`SELECT * FROM parkingsystem.parkingslots where status = 'Out' and users = 'TeacherStaff' and Description = ? `,vehicle,(errors,results)=>{
    if (errors)
      console.log(errors)
    else
      vehicleresults = results
  })
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(erruser,rsetuser)=>{
    if(erruser)
      console.log(erruser)
    else{
      const sql = "SELECT * FROM parkingsystem.teacher_faculty_reg where vehicledescription = ? and status = 'Accept'"
      const query = database.query(sql,vehicle,(err,rset)=>{
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          if(err)
            console.log(err)
          else
            Needtoout = req.flash("inmessage")
            plate = req.flash("plateno")
            const statuslevel = 'SuperAdmin'
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
              res.render('Admin_teacher_facultylogs',{
                rset,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                alert:Needtoout,
                hidden:'',
                plateno:plate,
                parkingslotsresult:vehicleresults
            })
            }else{
              res.render('Admin_teacher_facultylogs',{
                rset,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                alert:Needtoout,
                hidden:"hidden",
                plateno:plate,
                parkingslotsresult:vehicleresults
            })
            }
        }  
  })
    }
  })
})
app.post('/deletevlog/:vid/:adminuser/:idpslots', function (req, res) {
  const idpslots = req.params.idpslots
  const vid = req.params.vid
  var today = new Date();
  var hours = today.getHours()
  var minutes = today.getMinutes()
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const logs = hours + ':' + minutes + ' ' + newformat

  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()
  const days = "0"+day
  const addmonth = month + 1
  const joineddate = year+"-"+addmonth+"-"+days 

  const sql = "update parkingsystem.visitorslog set status = 'Out',tout = ? where idvisitorslog = ? ;"
  database.query(sql,[logs,vid],(err,rset)=>{
    if(err)
      console.log(err)
    else
      database.query(`update parkingsystem.parkingslots set status = 'Out',useroccupied = "" where idparkingslots = ?`,idpslots,(error,result)=>{
        if(error)
          console.log(error)
        else
          res.redirect('/visitorslog/'+req.params.adminuser)
      })
  })
})

app.get('/visitors/:admin', (req, res) => {
  const user = req.params.admin
  var parkingspacevisitors = ''
  database.query(`SELECT * FROM parkingsystem.parkingslots where description = 'Motorcyle' and status = 'Out' and users = 'Visitors';`,(err,result)=>{
    if(err)
      console.log(err)
    else
    parkingspacevisitors = result
  })
  var countvisitorsin = ''
  database.query(`select count(idparkingslots) as visitors from parkingslots where description = 'Motorcyle' and users = 'Visitors' and status = 'Out'`,(err,result)=>{
    if(err)
      console.log(err)
    else
      countvisitorsin = result
  })
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(err,rset)=>{
    if(err){
      console.log(err)
    }else{
      if(!req.session.usersignin){
        res.redirect("/")
    }else{
      const statuslevel = 'SuperAdmin'
      value = req.flash('data')
      fname = req.flash('fullname')
      purpose = req.flash('purpose')
      disabled = req.flash('disabled')
      if(statuslevel.localeCompare(rset[0].status) == 0){
        res.render("admin_visitorslogs",{
          username:rset[0].Username,
          parkingspacevisitors,
          fname:rset[0].user_account_fname,
          mname:rset[0].user_account_mname,
          lname:rset[0].user_account_lname,
          hidden:"",
          disabled:"",
          fullname:fname,
          purpose:purpose,
          countvisitorsin
        })
      }else{
        res.render("admin_visitorslogs",{
          username:rset[0].Username,
          parkingspacevisitors,
          fname:rset[0].user_account_fname,
          mname:rset[0].user_account_mname,
          lname:rset[0].user_account_lname,
          hidden:"hidden",
          disabled:'',
          fullname:fname,
          purpose:purpose,
          countvisitorsin
        })
      }
    }
    }
  })
})

app.get('/logout', function (req, res) {
  delete req.session.usersignin
  res.redirect('/')
})

app.get('/adminedit/:username', (req, res) => {
  const username = req.params.username
  const sql = "SELECT * FROM parkingsystem.user_account INNER JOIN parkingsystem.user_account_info ON user_account.Username = user_account_info.Username where user_account.Username = ?;"
  const query = database.query(sql,username,(err,rset)=>{
    if(err)
      console.log(err)
    else
      if(!req.session.usersignin){
          res.redirect("/")
      }else{
        
        console.log(rset)
        message = req.flash("successfuly")
        const statuslevel = 'SuperAdmin'
        if(statuslevel.localeCompare(rset[0].status) == 0){
          res.render('Admin_editprofile',{rset,
            username:username,
            successfuly:message,
            hidden:"",
            fname:rset[0].user_account_fname,
            mname:rset[0].user_account_mname,
            lname:rset[0].user_account_lname
          })
        }else{
          res.render('Admin_editprofile',{rset,
            username:username,
            successfuly:message,
            hidden:"hidden",
            fname:rset[0].user_account_fname,
            mname:rset[0].user_account_mname,
            lname:rset[0].user_account_lname
          })
        }
      }
  })
})
app.get('/invehicle/:username/:vdes', (req, res) => {
  const user = req.params.username
  const vdes = req.params.vdes
  var parkingslotsresult = ''
  var parkingslotsresults = ''
  var number = ''

  database.query(`SELECT * FROM parkingsystem.parkingslots where status = 'Out' and users = 'Student' and Description = 'Motorcyle'`,(err,result)=>{
    if(err)
      console.log(err)
    else
      parkingslotsresult = result
  })
  database.query(`SELECT * FROM parkingslots where status = 'Out' and users = 'Student' and Description = 'Four Wheeled Vehicle'`,(err,result)=>{
    if(err)
      console.log(err)
    else
      parkingslotsresults = result
  })
  database.query(`select count(idparkingslots) number from parkingslots where description = 'Motorcyle' and users = 'Student' and status = 'Out'`,(err,rset)=>{
    if(err)
      console.log(err)
    else
      number = rset
  })
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(erruser,rsetuser)=>{
    if(erruser)
      console.log(erruser)
    else{
      const sql = "SELECT * FROM parkingsystem.vehicletable where status = 'Accept' and vehicletable_descript = ? "
      const query = database.query(sql,vdes,(err,rset)=>{
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          if(err)
            console.log(err)
          else
            Needtoout = req.flash("Needtoout")
            platenumber = req.flash("platenumber")
            const statuslevel = 'SuperAdmin'
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
              res.render('Admin_StudentLogs',{
                rset,
                number,
                parkingslotsresult,
                parkingslotsresults,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                sweetalert: Needtoout,
                platenumber:platenumber,
                hidden:""
              })
            }else{
              res.render('Admin_StudentLogs',{
                rset,
                number,
                parkingslotsresult,
                parkingslotsresults,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                sweetalert: Needtoout,
                platenumber:platenumber,
                hidden:"hidden"
              })
            }
        }  
    })
    }
  })
})

app.get('/adminlist/:admin', (req, res) => {
  const user = req.params.admin
  const Sql = "select * from parkingsystem.user_account_info where Username = ?"
  const Query = database.query(Sql,user,(erruser,rsetuser)=>{
    if(erruser)
      console.log(erruser)
    else{
      const sql = "select * from parkingsystem.user_account_info"
      const query = database.query(sql,(err,rset)=>{
        if(!req.session.usersignin){
          res.redirect("/")
        }else{
          if(err)
            console.log(err)
          else{
            
            const statuslevel = 'SuperAdmin'
            if(statuslevel.localeCompare(rsetuser[0].status) == 0){
              res.render('adminuserlist',{
                rset,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                hidden:"",
                sweetalert:req.flash("adminlistmessage")
              })
            }else{
              res.render('adminuserlist',{
                rset,
                username:rsetuser[0].Username,
                fname:rsetuser[0].user_account_fname,
                lname:rsetuser[0].user_account_lname,
                mname:rsetuser[0].user_account_mname,
                hidden:"hidden",
                sweetalert:req.flash("adminlistmessage")
              })
            }
          }
        }  
    })
    }
  })
})
app.get('/thermal', (req, res) => {
  res.render('printthermal')
})
/*Changepass*/
app.post('/changepassadmin/:username', async (req, res) => {
  const username = req.params.username
  const password = await bcrypt.hash(req.body.adminchangepassword,10)
  const sql = "update parkingsystem.visitorslog set tout = 'Out' where idvisitorslog = ? ;"
  const query =database.query(sql,[password,username],(err,rset)=>{
      if(err)
      console.log(err)
      else
      console.log(rset)
      res.redirect("/admin/"+username)
  })
})
/*end*/
app.post('/addparkingspace/:admin/:vdesc/:users', function (req, res) {
  const vdes = req.params.vdesc
  const users= req.params.users
  const parkingnumber = req.body.parkingnumber
  const admin = req.params.admin
  
  const data = {
    description:vdes,
    status:'Out',
    users:users,
    pakingnumber:parkingnumber
  }
  database.query(`insert into parkingslots set  ?`,data,(err,rset)=>{
    if(err)
      console.log(err)
    else
      res.redirect('/parking/'+admin+"/"+vdes+"/"+users)
  })
})
app.get('/admincategory', (req, res) => {
  res.render('adminvehiclecategory')
})
app.get('/parking/:admin/:vehicle/:users', (req, res) => {
  const admin = req.params.admin
  const vehicle = req.params.vehicle
  const users = req.params.users
  const adminquery = "select * from parkingsystem.user_account_info where Username = ?"
  database.query(adminquery,admin,(err,rsetuser)=>{
    if(err)
      console.log(err)
    else{
      database.query(`SELECT description FROM parkingsystem.parkingslots where  description = ? and users = ? ;`,[vehicle,users],(errdes,result)=>{
        if(errdes)
          console.log(errdes)
        else
          console.log(result)
          if(result == ""){
            database.query(`SELECT * FROM parkingsystem.parkingslots where description = ? and users = ?;`,[vehicle,users],(errs,rsets)=>{
              if (errs){
                console.log("eto error ko")
                console.log(errs)
              }else{
                console.log(rsets)
                const statuslevel = 'SuperAdmin'
                if(statuslevel.localeCompare(rsetuser[0].status) == 0){
                  res.render('manageparking',{  
                    rsets,
                    vehicletable_descript:vehicle,
                    users:users,
                    username:rsetuser[0].Username,
                    fname:rsetuser[0].user_account_fname,
                    lname:rsetuser[0].user_account_lname,
                    mname:rsetuser[0].user_account_mname,
                    hidden:"",
                  })
                }else{
                  res.render('manageparking',{
                    rsets,
                    vehicletable_descript:vehicle,
                    users:users,
                    username:rsetuser[0].Username,
                    fname:rsetuser[0].user_account_fname,
                    lname:rsetuser[0].user_account_lname,
                    mname:rsetuser[0].user_account_mname,
                    hidden:"hidden",
                  })
                }
              }
            })
          }else{
            database.query(`SELECT * FROM parkingsystem.parkingslots where description = ? and users = ?;`,[vehicle,users],(errs,rsets)=>{
              if (errs){
                console.log("eto error ko")
                console.log(errs)
              }else{
                console.log(rsets)
                const statuslevel = 'SuperAdmin'
                if(statuslevel.localeCompare(rsetuser[0].status) == 0){
                  res.render('manageparking',{  
                    rsets,
                    vehicletable_descript:rsets[0].description,
                    users:rsets[0].users,
                    username:rsetuser[0].Username,
                    fname:rsetuser[0].user_account_fname,
                    lname:rsetuser[0].user_account_lname,
                    mname:rsetuser[0].user_account_mname,
                    hidden:"",
                  })
                }else{
                  res.render('manageparking',{
                    rsets,
                    vehicletable_descript:rsets[0].description,
                    users:rsets[0].users,
                    username:rsetuser[0].Username,
                    fname:rsetuser[0].user_account_fname,
                    lname:rsetuser[0].user_account_lname,
                    mname:rsetuser[0].user_account_mname,
                    hidden:"hidden",
                  })
                }
              }
            })
          }
      })
    }
  })
})
/*puppeter*/
app.get('/wew', (req, res) => {
  res.render('samplebutton')
})
app.post('/Ticket', async (req, res) => {
    // Create a browser instance
    const browser = await puppeteer.launch();
  
    // Create a new page
    const page = await browser.newPage();
  
    //Get HTML content from ejs file
    const html = fs.readFileSync('views/sample.ejs', 'utf-8');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');
  
    // Downlaod the PDF
    const pdf = await page.pdf({
      path: 'ticket.pdf',
      margin: { top: '10 px', bottom: '50 px'},
      printBackground: true,
      width: '4.8 cm',
      height: '210 cm' 
    });

    const path = './ticket.pdf'
    if (fs.existsSync(path)) {
        fs.createReadStream(path).pipe(res)
    } else {
        res.status(500)
        console.log('File not found')
        res.send('File not found')
    }
    // Close the browser instance
    await browser.close();
})
/*end*/
app.post('/search', function (req, res) {
  const plateno = req.body.platenumber
  const type = req.body.type
  res.send(plateno+" "+type)
})

app.post('/update/:id', function (req, res) {
  res.send('POST request to the homepage epi')
})
app.post('/delete/:admin/:vdes/:vusers/:idparkingslots', function (req, res) {
  const admin = req.params.admin
  const vdes = req.params.vdes
  const vusers = req.params.vusers
  const idparkingslots = req.params.idparkingslots

  database.query(`delete FROM parkingslots where idparkingslots = ?;`,idparkingslots,(err,rset)=>{
    if(err)
      console.log(err)
    else
      res.redirect("/parking/"+admin+"/"+vdes+"/"+vusers)
  })

})




app.use((req,res,next)=>{
  res.status(404).send('Page Not Found')
})












app.listen(port, () => console.log(`Example app listening on port ${port}!`))
