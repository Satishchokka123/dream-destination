const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();


app.use(cors());
app.use(express.json());


// HTML files folder
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "Dream.html"));
});

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err)=>{

    if(err)
    {
        console.log("Database connection failed:",err);
    }
    else
    {
        console.log("Connected to MySQL");
    }

});



// Register API

app.post("/register",(req,res)=>{


    const {name,email,phone,password}=req.body;


    console.log(req.body);



    const checkSql="SELECT * FROM user WHERE email=?";


    db.query(checkSql,[email],(err,result)=>{


        if(err)
        {
            console.log(err);

            return res.json({

                success:false,
                message:"Database Error"

            });

        }



        if(result.length>0)
        {

            return res.json({

                success:false,
                message:"Email already exists"

            });

        }



        const insertSql=
        "INSERT INTO user(name,email,phone,password) VALUES(?,?,?,?)";



        db.query(insertSql,
        [name,email,phone,password],
        (err,result)=>{


            if(err)
            {
                console.log(err);

                return res.json({

                    success:false,
                    message:"Registration Failed"

                });

            }



            res.json({

                success:true,
                message:"Registration Successful"

            });



        });


    });


});

// Login API

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM user WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.json({
                success:false,
                message:"Database error"
            });
        }


        if (result.length > 0) {

            res.json({
                success:true,
                message:"Login successful"
            });

        } 
        else {

            res.json({
                success:false,
                message:"Invalid email or password"
            });

        }

    });

});





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});