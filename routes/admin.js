const express = require('express')
const flash = require("connect-flash")
const cookie = require("cookie-parser")
const session = require("express-session")
const database = require('../connectionDb/connectionDB');
const app = express()
const router = express.Router()

app.use(cookie('SecretStringForCookies'));
app.use(session({
    secret: "SecretStingForSession",
    cookie: {maxAge : 1000 * 60 * 60 * 24},
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

router.get('/admin/:username', (req, res) => {
    const username = req.params.username
    var qlformortorcyleresult = ""
    var qlformortorcyleresultusers = ""
    var sqlvdescripttion = ""
    var resultfor4wheels = ""
    var ResultsTeacherfor4wheel = ""
    var Faculty = ''
    var FacultyDateRegister = ''
    var FacultyDateRegisters = ''

    const teachervehicle = "Select vehicledescription as vdescript, count(*) as vdescount from teacher_faculty_reg where status = 'Accept' Group by vehicledescription"
    database.query(teachervehicle,(error,results)=>{
        if(error)
            console.log(error)
        else
            FacultyDateRegisters = results
    })

    const teacher = 'Select YEAR(dateregister) as peryear,count(*) as countperyear from teacher_faculty_reg where status = "Accept" Group by YEAR(dateregister) ORDER BY YEAR(dateregister) DESC limit 5; '
    database.query(teacher,(err,result)=>{
        if(err)
            console.log(err)
        else
            FacultyDateRegister = result
    })

    const faculty = `select count(idparkingslots) as teacherstaff from parkingslots where description = 'Motorcyle' and users = 'TeacherStaff' and status = 'Out'`
    database.query(faculty,(err,rset)=>{
        if(err)
            console.log(err)
        else
            Faculty = rset
    })

    const sqlformortorcyle = `select count(idparkingslots) as availablespace from parkingslots where description = 'Motorcyle' and users = 'Student'  and status = 'Out'`
    const queryformortorcyle = database.query(sqlformortorcyle,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            qlformortorcyleresult = rsets
        }
    })
    var visitorcounts = ''
    const visitorcount="Select COUNT(idvisitorslog) AS users from visitorslog where status = 'In'"
    database.query(visitorcount,(err,rset)=>{
        if(err)
            console.log(err)
        else
         visitorcounts = rset
    })
    const sqlfor4wheel = `select count(idparkingslots) as availablespace from parkingslots where description = 'Four Wheeled Vehicle' and status = 'Out'`
    const querysqlfor4wheel  = database.query(sqlfor4wheel ,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            resultfor4wheels  = rsets
        }
    })
    const sqlvdescript = "Select vehicletable_descript as vdescript,count(*) as vdescount from vehicletable where status = 'Accept' Group by vehicletable_descript"
    const queryvdescript = database.query(sqlvdescript,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            sqlvdescripttion = rsets
        }
    })
    const sqlformortorcyleusers = "Select COUNT(username) AS users from vehicletable where vehicletable_descript = 'Motorcyle' AND LogsInOut ='In' AND status = 'Accept'"
    const queryformortorcyleusers = database.query(sqlformortorcyleusers,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            qlformortorcyleresultusers = rsets
        }
    })
    var for4wheelcounts = ""
    const sqlfor4wheelcount = `select count(idparkingslots) as teacherstaff from parkingslots where description = 'Four Wheeled Vehicle' and users = 'Student' and status = 'In'`
    const queryfor4wheelcount  = database.query(sqlfor4wheelcount,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            for4wheelcounts = rsets
        }
    })

    var for4wheelcountsteacher = ""
    const sqlfor4wheelcounttheacher = `select count(idparkingslots) as teacherstaff from parkingslots where description = 'FourWheeledVehicle' and users = 'TeacherStaff' and status = 'In'`
    const queryfor4wheelcountteacher  = database.query(sqlfor4wheelcounttheacher,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            for4wheelcountsteacher = rsets
        }
    })

    const sqlTeacherfor4wheel = `select count(idparkingslots) as teacherstaff from parkingslots where description = 'FourWheeledVehicle' and users = 'TeacherStaff' and status = 'Out'`
    database.query(sqlTeacherfor4wheel,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            ResultsTeacherfor4wheel = rsets
        }
    })
    var sqlvisitors = ''
    var sqlvisitor = "select count(idparkingslots) as visitors from parkingslots where description = 'Motorcyle' and users = 'Visitors' and status = 'Out'"
    database.query(sqlvisitor,(err,rset)=>{
        if(err)
            console.log(err)
        else    
            sqlvisitors = rset
    })
    var ResultsTeacherfor4wheelresults = "" //motorcycle
    const sqlTeacherforwheels = `select count(idparkingslots) as teacherstaff from parkingslots where description = 'Motorcyle' and users = 'TeacherStaff' and status = 'In'`
    database.query(sqlTeacherforwheels,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            ResultsTeacherfor4wheelresults = rsets
        }
    })
    const sqlyear = "Select YEAR(dateregister) as peryear,count(*) as countperyear from vehicletable where status = 'Accept' Group by YEAR(dateregister) ORDER BY YEAR(dateregister) DESC limit 5;"
    const queryyear = database.query(sqlyear,(err,rsets)=>{
        if(err)
            console.log(err)
        else{
            const sql ="select * from user_account_info where Username = ?"
            const query = database.query(sql,username,(err,rset)=>{
                if(err)
                    console.log(err) 
                else{
                    if(!req.session.usersignin){
                        res.redirect("/")
                    }else{
                        const statuslevel = 'SuperAdmin'
                        if(statuslevel.localeCompare(rset[0].status) == 0){
                            res.render('Admin_dashboard',{
                                rsets,
                                FacultyDateRegister,
                                username:rset[0].Username,
                                fname:rset[0].user_account_fname,
                                lname:rset[0].user_account_lname,
                                mname:rset[0].user_account_mname,
                                hidden:"",
                                motor:qlformortorcyleresult[0].availablespace,
                                motorusers:qlformortorcyleresultusers[0].users,
                                sqlvdescripttion,
                                fourwheeledresult:resultfor4wheels[0].availablespace,
                                fourwheelin:for4wheelcounts[0].teacherstaff,
                                fourwheelinteacher:for4wheelcountsteacher[0].teacherstaff,
                                ResultsTeacherfor4wheel:ResultsTeacherfor4wheel[0].teacherstaff,
                                facultyteacher:ResultsTeacherfor4wheelresults[0].teacherstaff,
                                motorcycle:Faculty[0].teacherstaff,
                                visitor:sqlvisitors[0].visitors,
                                FacultyDateRegister,
                                FacultyDateRegisters,
                                visitorcounts
                                /*pie chart*/
                            })
                        }else{
                            res.render('Admin_dashboard',{
                                rsets,
                                FacultyDateRegister,
                                username:rset[0].Username,
                                fname:rset[0].user_account_fname,
                                lname:rset[0].user_account_lname,
                                mname:rset[0].user_account_mname,
                                hidden:"hidden",
                                motor:qlformortorcyleresult[0].availablespace,
                                motorusers:qlformortorcyleresultusers[0].users,
                                sqlvdescripttion,
                                fourwheeledresult:resultfor4wheels[0].availablespace,
                                fourwheelin:for4wheelcounts[0].teacherstaff,
                                fourwheelinteacher:for4wheelcountsteacher[0].teacherstaff,
                                ResultsTeacherfor4wheel:ResultsTeacherfor4wheel[0].teacherstaff,
                                facultyteacher:ResultsTeacherfor4wheelresults[0].teacherstaff,
                                motorcycle:Faculty[0].teacherstaff,
                                visitor:sqlvisitors[0].visitors,
                                FacultyDateRegister,
                                FacultyDateRegisters,
                                visitorcounts
                                /*pie chart*/
                            })
                        }
                    }
                }
            })
        }
    }) 
})

module.exports = router