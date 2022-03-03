let http = require('http');
let obj_url = require('url');
let obj_file = require('fs');
const formidable = require('formidable');
let mysql = require('mysql');
let nodemailer = require('nodemailer');
var counter = 0;
                        

http.createServer((req,res)=>{
    let req_url = obj_url.parse(req.url,true);
    if(req_url.pathname == "/register" || req_url.pathname == "/"){
        obj_file.readFile('./pages/register.html',(err,data)=>{
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write(data);
            return res.end();
        })
    }else if(req_url.pathname == "/login"){
        obj_file.readFile('./pages/login.html',(err,data)=>{
            res.writeHead(200,{'Content-Type':'text/html'});
            res.write(data);
            return res.end();
        })
    }else if(req_url.pathname == "/registerdb"){
        let form_data = new formidable.IncomingForm();
        form_data.parse(req, (err, fields, file)=>{
            let fname = fields.fname;
            let lname = fields.lname;
            let email = fields.email;
            let dob = fields.dob;
            let gender = fields.gender;
            let password = fields.pass;
            let db_con = mysql.createConnection({
                host:'localhost',
                user:'root',
                password:'',
                database:'finalproject'
            })
            db_con.connect((err)=>{
                if (err) throw err;
                let my_query = "INSERT INTO users_data (first_name,last_name,email,dob,gender,password) VALUES ('"+fname+"','"+lname+"','"+email+"','"+dob+"','"+gender+"','"+password+"')";
                db_con.query(my_query, (err,result)=>{
                    if(err) throw err;
                    res.writeHead(200,{'Content-Type':'text/html'});
                    res.write("You have been registered succesfully");
                    return res.end();
                })
            })

        })
    }else if(req_url.pathname == "/logindb"){
        let form_login = new formidable.IncomingForm();
        form_login.parse(req, (err,fields,files)=>{
            let userlogin = fields.loginemail;
            let userpass = fields.passlogin;
            let db_con = mysql.createConnection({
                host:'localhost',
                user:'root',
                password:'',
                database:'finalproject'
            });
            db_con.connect((err)=>{
                if(err) throw err;
                let my_querylogin = "SELECT * FROM users_data WHERE email='" +userlogin+ "'";
                db_con.query(my_querylogin, (err,results, fields)=>{
                    let mydata = results;
                    if(mydata.length == 1){
                        if(mydata[0].password == userpass){
                            res.writeHead(200,{'Content-Type':'text/html'});
                            res.write("Logged in");
                            counter = 0;
                            return res.end();
                        }else if(mydata[0].email == userlogin && mydata[0].password != userpass ){
                            counter++;
                            if(counter == 3){
                                let transporter = nodemailer.createTransport({
                                    service:'gmail',
                                    auth:{
                                        user:'testnametst@gmail.com',
                                        pass:'mypasstest1234$'
                                    }
                                });
                                let mail_options = {
                                    from:'testnametst@gmail.com',
                                    to:userlogin,
                                    subject:'Wrong password',
                                    text:'Dear client, Here is your information:First name:'+mydata[0].first_name + 'Last name:'+mydata[0].lastname + 'Email:'+mydata[0].email + 'Current password:' + mydata[0].password
                                }
                                transporter.sendMail(mail_options, (err,info)=>{
                                    res.writeHead(200,{'Content-Type':'text/html'});
                                    res.write("Your password has been written 3 times wrong. An email was sent");
                                    return res.end();

                                })
                            }else{
                                res.writeHead(200,{'Content-Type':'text/html'});
                                res.write("Wrong Password, try again");
                                return res.end();
                            }
                            
                        }
                    }else{
                        res.writeHead(200,{'Content-Type':'text/html'});
                        res.write("The user does not exist");
                        return res.end();
                    }                   
                })
            })
            
        })
    }

}).listen(8080);