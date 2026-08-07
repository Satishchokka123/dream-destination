const fs = require("fs");
const multer = require("multer");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");

const checkLogin = require("./middleware/auth");

app.use(
 session({
   secret:"dreamdestination123",
   resave:false,
   saveUninitialized:false
 })
);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Static folders

app.use(express.static(path.join(__dirname, "views")));

app.use("/admin", express.static(path.join(__dirname, "admin")));

app.use("/css", express.static(path.join(__dirname, "css")));

app.use("/js", express.static(path.join(__dirname, "js")));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/payment", express.static(path.join(__dirname, "payment")));


// HTML files folder
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "Dream.html"));
});




const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dream destination"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// ======================================
// Multer Configuration
// ======================================

const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(null, "images/packages");

    },

    filename: function(req, file, cb){

        const uniqueName =
        Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({
    storage: storage
});

// ======================================
// Dashboard Statistics
// ======================================

app.get("/api/admin/dashboard", (req, res) => {

    const dashboard = {};

    db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, users) => {

        if(err) return res.status(500).json(err);

        dashboard.totalUsers = users[0].totalUsers;

        db.query("SELECT COUNT(*) AS totalPackages FROM packages", (err, packages) => {

            if(err) return res.status(500).json(err);

            dashboard.totalPackages = packages[0].totalPackages;

            db.query("SELECT COUNT(*) AS totalBookings FROM bookings", (err, bookings) => {

                if(err) return res.status(500).json(err);

                dashboard.totalBookings = bookings[0].totalBookings;

                db.query("SELECT IFNULL(SUM(total_price),0) AS totalRevenue FROM bookings", (err, revenue) => {

                    if(err) return res.status(500).json(err);

                    dashboard.totalRevenue = revenue[0].totalRevenue;

                    res.json(dashboard);

                });

            });

        });

    });

});

// ======================================
// Recent Bookings
// ======================================

app.get("/api/admin/recent-bookings", (req, res) => {

    const sql = `
        SELECT
            b.id,
            b.full_name,
            p.package_name,
            b.destination,
            b.total_price
        FROM bookings b

        INNER JOIN packages p

        ON b.package_id = p.id

        ORDER BY b.id DESC

        LIMIT 5
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json(err);

        }

        res.json(result);

    });

});


// Register API

// ================= REGISTER API =================

app.post("/api/register", async(req,res)=>{

const {name,email,password}=req.body;


const hashPassword = await bcrypt.hash(password,10);


db.query(
"INSERT INTO users(name,email,password) VALUES(?,?,?)",
[name,email,hashPassword],

(err,result)=>{

if(err){
return res.json({
message:"Email already exists"
});
}


res.json({
message:"Registration successful"
});


});


});

// Login API

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Database Error"
                });
            }

            if (result.length === 0) {
                return res.status(401).json({
                    message: "User not found"
                });
            }

            const user = result[0];

            const match = await bcrypt.compare(password, user.password);

            if (match) {

                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };

                return res.json({
                    message: "Login success",
                    user: req.session.user
                });

            } else {

                return res.status(401).json({
                    message: "Wrong password"
                });
            }
        }
    );
});


// route-charge
app.get("/api/route-price", (req, res) => {

    const { from, destination } = req.query;

    db.query(

        "SELECT extra_charge FROM route_charges WHERE from_city=? AND destination=?",

        [from, destination],

        (err, result) => {

            if (err)
                return res.status(500).json(err);

            if (result.length === 0) {

                return res.json({
                    extra_charge: 0
                });

            }

            res.json(result[0]);

        }

    );

});

// ======================================
// Get All Packages
// ======================================

app.get("/api/packages", (req, res) => {

    const sql = `
        SELECT *
        FROM packages
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json(result);

    });

});
// ========================================
// get package
// ========================================

app.get("/api/packages/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM packages WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Package not found"
                });
            }

            res.json(result[0]);

        }
    );

});

// ======================================
// Update Package
// ======================================

app.put("/api/packages/:id", upload.single("image"), (req, res) => {

    const id = req.params.id;

    const package_name = req.body.package_name;
    const destination = req.body.destination;
    const category = req.body.category;
    const base_price = req.body.base_price;
    const duration = req.body.duration;
    const description = req.body.description;

    db.query(

        "SELECT image FROM packages WHERE id=?",

        [id],

        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (result.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Package not found"
                });

            }

            let image = result[0].image;

            // New image uploaded
            if (req.file) {

                // Delete old image
                if (image) {

                    const oldImagePath = path.join(__dirname, "images", "packages", image);

                    if (fs.existsSync(oldImagePath)) {

                        fs.unlinkSync(oldImagePath);

                    }

                }

                image = req.file.filename;

            }

            const sql = `
                UPDATE packages
                SET package_name=?,
                    destination=?,
                    category=?,
                    base_price=?,
                    description=?,
                    duration=?,
                    image=?
                WHERE id=?
            `;

            db.query(

                sql,

                [

                    package_name,
                    destination,
                    category,
                    base_price,
                    description,
                    duration,
                    image,
                    id

                ],

                (err) => {

                    if (err) {

                        return res.status(500).json(err);

                    }

                    res.json({

                        success: true,
                        message: "Package Updated Successfully"

                    });

                }

            );

        }

    );

});

// =============================
// Get All Cities
// =============================

app.get("/api/cities", (req, res) => {

    const sql = "SELECT * FROM cities ORDER BY city_name ASC";

    db.query(sql, (err, result) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json(result);

    });

});
// ==========================================
// Get Transport Charge
// ==========================================

app.get("/api/transport-price", (req, res) => {

    const { from, destination, transport } = req.query;

    const sql = `
        SELECT charge
        FROM transport_charges
        WHERE from_city = ?
        AND destination = ?
        AND transport_type = ?
    `;

    db.query(sql, [from, destination, transport], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database Error" });
        }

        if (result.length === 0) {
            return res.json({ charge: 0 });
        }

        res.json(result[0]);

    });

});
// ==========================================
// Get Hotel Charge
// ==========================================

app.get("/api/hotel-price", (req, res) => {

    const { destination, hotel } = req.query;

    const sql = `
        SELECT charge
        FROM hotel_charges
        WHERE destination = ?
        AND hotel_category = ?
    `;

    db.query(sql, [destination, hotel], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.json({
                charge: 0
            });
        }

        res.json(result[0]);

    });

});
// ==========================================
// Get Extra Service Charge
// ==========================================

app.get("/api/extra-price", (req, res) => {

    const service = req.query.service;

    db.query(

        "SELECT charge FROM extra_services WHERE service_name = ?",

        [service],

        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.json({
                    charge: 0
                });
            }

            res.json(result[0]);

        }

    );

});

// ==========================================
// Save Booking
// ==========================================

app.post("/api/bookings", (req, res) => {

    const booking = req.body;

    const sql = `
    INSERT INTO bookings (
        package_id,
        full_name,
        email,
        mobile,
        gender,
        address,
        from_city,
        destination,
        travel_date,
        return_date,
        adults,
        children,
        transport,
        hotel,
        breakfast,
        pickup,
        sightseeing,
        insurance,
        total_price
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    db.query(sql, [

        booking.package_id,
        booking.full_name,
        booking.email,
        booking.mobile,
        booking.gender,
        booking.address,
        booking.from_city,
        booking.destination,
        booking.travel_date,
        booking.return_date,
        booking.adults,
        booking.children,
        booking.transport,
        booking.hotel,
        booking.breakfast,
        booking.pickup,
        booking.sightseeing,
        booking.insurance,
        booking.total_price

    ], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Booking Failed"
            });
        }

        res.json({

            success: true,

            bookingId: result.insertId

        });

    });

});

// ==========================================
// Get Booking By ID
// ==========================================

app.get("/api/bookings/:id",(req,res)=>{

    const id=req.params.id;

    const sql=`

    SELECT

    bookings.*,

    packages.package_name

    FROM bookings

    INNER JOIN packages

    ON bookings.package_id=packages.id

    WHERE bookings.id=?

    `;

    db.query(sql,[id],(err,result)=>{

        if(err){

            return res.status(500).json(err);

        }

        if(result.length===0){

            return res.status(404).json({

                message:"Booking Not Found"

            });

        }

        res.json(result[0]);

    });

});


//GET BOOKINGS
app.get("/api/bookings", (req, res) => {

    const sql = `

        SELECT

            bookings.id,
            bookings.full_name,
            packages.package_name,
            bookings.travel_date,
            bookings.adults,
            bookings.children,
            bookings.total_price,
            bookings.status

        FROM bookings

        INNER JOIN packages

        ON bookings.package_id = packages.id

        ORDER BY bookings.id DESC

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json(result);

    });

});

//PUT Bookings

app.put("/api/bookings/:id/status", (req, res) => {

    const id = req.params.id;

    const status = req.body.status;

    const sql = `
        UPDATE bookings
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            message: "Booking Status Updated Successfully"
        });

    });

});


// ======================================
// Admin Login API
// ======================================

app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT *
        FROM admins
        WHERE email = ?
    `;

    db.query(sql, [email], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        if (result.length === 0) {

            return res.json({
                success: false,
                message: "Admin not found"
            });

        }

        const admin = result[0];

        if (admin.password !== password) {

            return res.json({
                success: false,
                message: "Incorrect Password"
            });

        }

        res.json({

            success: true,

            message: "Login Successful",

            admin: {

                id: admin.id,

                name: admin.name,

                email: admin.email

            }

        });

    });

});

// ======================================
// Monthly Revenue Chart
// ======================================

app.get("/api/admin/revenue-chart", (req, res) => {

    const sql = `
        SELECT

            MONTH(booking_date) AS month,

            SUM(total_price) AS revenue

        FROM bookings

        GROUP BY MONTH(booking_date)

        ORDER BY MONTH(booking_date)
    `;

    db.query(sql, (err, result) => {

        if(err){

            console.log(err);

            return res.status(500).json(err);

        }

        res.json(result);

    });

});

// ======================================
// Booking Status Chart
// ======================================

app.get("/api/admin/booking-status", (req, res) => {

    const sql = `
        SELECT

            status,

            COUNT(*) AS total

        FROM bookings

        GROUP BY status
    `;

    db.query(sql, (err, result) => {

        if(err){

            console.log(err);

            return res.status(500).json(err);

        }

        res.json(result);

    });

});

app.get("/api/packages", (req, res) => {

    db.query(
        "SELECT * FROM packages ORDER BY id DESC",
        (err, result) => {

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }
    );

});


// ======================================
// Add Package
// ======================================

app.post("/api/packages", upload.single("image"), (req, res) => {

    const package_name = req.body.package_name;
    const destination = req.body.destination;
    const category = req.body.category;
    const base_price = req.body.base_price;
    const duration = req.body.duration;
    const description = req.body.description;

    const image = req.file ? req.file.filename : "";

    const sql = `
        INSERT INTO packages
(package_name,destination,category,base_price,image,description,duration)
VALUES (?,?,?,?,?,?,?)
    `;

    db.query(

        sql,

        [
package_name,
destination,
category,
base_price,
imageName,
description,
duration
],

        (err)=>{

            if(err){

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"Package Added Successfully"

            });

        }

    );

});
// ======================================
// Delete Package
// ======================================

app.delete("/api/packages/:id", (req, res) => {

    const id = req.params.id;

    db.query(

        "DELETE FROM packages WHERE id=?",

        [id],

        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json({

                success: true,

                message: "Package Deleted Successfully"

            });

        }

    );

});

// =========================
// GET ALL USERS
// =========================

app.get("/api/user", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            status,
            created_at
        FROM user
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json(result);

    });

});

// =========================
// GET SINGLE USER
// =========================

app.get("/api/user/:id", (req, res) => {

    const id = req.params.id;

    db.query(

        "SELECT * FROM user WHERE id=?",

        [id],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            if (result.length == 0) {

                return res.status(404).json({
                    message: "User not found"
                });

            }

            res.json(result[0]);

        }

    );

});

// =========================
// BLOCK / UNBLOCK USER
// =========================

app.put("/api/user/:id/status", (req, res) => {

    const id = req.params.id;

    const { status } = req.body;

    db.query(

        "UPDATE user SET status=? WHERE id=?",

        [status, id],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            res.json({
                message: "User status updated successfully"
            });

        }

    );

});

// =========================
// DELETE USER
// =========================

app.delete("/api/user/:id", (req, res) => {

    const id = req.params.id;

    db.query(

        "DELETE FROM user WHERE id=?",

        [id],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            res.json({
                message: "User deleted successfully"
            });

        }

    );

});


// ======================================
// REPORT DASHBOARD
// ======================================

app.get("/api/report/dashboard", (req, res) => {

    const sql = `
    SELECT

    (SELECT IFNULL(SUM(total_price),0) FROM bookings) AS revenue,

    (SELECT COUNT(*) FROM bookings) AS bookings,

    (SELECT COUNT(*) FROM user) AS users,

    (SELECT COUNT(*) FROM packages) AS packages
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json(result[0]);

    });

});

// ======================================
// RECENT BOOKINGS
// ======================================

app.get("/api/report/recent-bookings", (req, res) => {

    const sql = `

    SELECT

    id,

    full_name,

    destination,

    travel_date,

    total_price,

    status

    FROM bookings

    ORDER BY id DESC

    LIMIT 10

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json(result);

    });

});

// ======================================
// MONTHLY REVENUE
// ======================================

app.get("/api/report/monthly-revenue", (req, res) => {

    const sql = `

    SELECT

    MONTHNAME(booking_date) AS month,

    SUM(total_price) AS revenue

    FROM bookings

    GROUP BY MONTH(booking_date)

    ORDER BY MONTH(booking_date)

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json({

            labels: result.map(r => r.month),

            values: result.map(r => r.revenue)

        });

    });

});

// ======================================
// MONTHLY BOOKINGS
// ======================================

app.get("/api/report/monthly-bookings", (req, res) => {

    const sql = `

    SELECT

    MONTHNAME(booking_date) AS month,

    COUNT(*) AS bookings

    FROM bookings

    GROUP BY MONTH(booking_date)

    ORDER BY MONTH(booking_date)

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json({

            labels: result.map(r => r.month),

            values: result.map(r => r.bookings)

        });

    });

});

// ======================================
// BOOKING STATUS
// ======================================

app.get("/api/report/status", (req, res) => {

    const sql = `

    SELECT

    SUM(status='Pending') AS pending,

    SUM(status='Confirmed') AS confirmed,

    SUM(status='Cancelled') AS cancelled

    FROM bookings

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json(result[0]);

    });

});

// =====================================
// GET SINGLE PACKAGE DETAILS
// =====================================

app.get("/api/packages/:id", (req, res) => {

    const packageId = req.params.id;

    db.query(

        "SELECT * FROM packages WHERE id = ?",

        [packageId],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            if (result.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Package Not Found"
                });

            }

            res.json(result[0]);

        }

    );

});

// ======================================
// GET ALL PICKUP CITIES
// ======================================

app.get("/api/pickup-cities",(req,res)=>{

    db.query(

        "SELECT * FROM pickup_cities ORDER BY city_name ASC",

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }

    );

});

// ======================================
// GET ACTIVE PICKUP CITIES
// ======================================

app.get("/api/pickup-cities/active",(req,res)=>{

    db.query(

        "SELECT * FROM pickup_cities WHERE status='Active' ORDER BY city_name ASC",

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }

    );

});

// ======================================
// ADD PICKUP CITY
// ======================================

app.post("/api/pickup-cities",(req,res)=>{

    const{

        city_name,

        charge,

        status

    }=req.body;

    db.query(

        `

        INSERT INTO pickup_cities

        (city_name,charge,status)

        VALUES (?,?,?)

        `,

        [

            city_name,

            charge,

            status

        ],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"City Added Successfully"

            });

        }

    );

});

// ======================================
// UPDATE PICKUP CITY
// ======================================

app.put("/api/pickup-cities/:id",(req,res)=>{

    const id = req.params.id;

    const{

        city_name,

        charge,

        status

    } = req.body;

    db.query(

        `

        UPDATE pickup_cities

        SET

        city_name=?,

        charge=?,

        status=?

        WHERE id=?

        `,

        [

            city_name,

            charge,

            status,

            id

        ],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"City Updated Successfully"

            });

        }

    );

});

// ======================================
// DELETE PICKUP CITY
// ======================================

app.delete("/api/pickup-cities/:id",(req,res)=>{

    const id = req.params.id;

    db.query(

        "DELETE FROM pickup_cities WHERE id=?",

        [id],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"City Deleted Successfully"

            });

        }

    );

});

// ======================================
// GET ALL TRANSPORT CHARGES
// ======================================

app.get("/api/transport-charges",(req,res)=>{

    db.query(

        "SELECT * FROM transport_charges ORDER BY transport_name ASC",

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }

    );

});

// ======================================
// GET ACTIVE TRANSPORT CHARGES
// ======================================

app.get("/api/transport-charges/active",(req,res)=>{

    db.query(

        "SELECT * FROM transport_charges WHERE status='Active' ORDER BY transport_name ASC",

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }

    );

});

// ======================================
// ADD TRANSPORT
// ======================================

app.post("/api/transport-charges",(req,res)=>{

    const{

        transport_name,

        charge,

        status

    } = req.body;

    db.query(

        `

        INSERT INTO transport_charges

        (transport_name,charge,status)

        VALUES (?,?,?)

        `,

        [

            transport_name,

            charge,

            status

        ],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"Transport Added Successfully"

            });

        }

    );

});

// ======================================
// GET ALL HOTEL CHARGES
// ======================================

app.get("/api/hotel-charges",(req,res)=>{

    db.query(

        "SELECT * FROM hotel_charges ORDER BY hotel_type ASC",

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }

    );

});

// ======================================
// GET ACTIVE HOTEL CHARGES
// ======================================

app.get("/api/hotel-charges/active",(req,res)=>{

    db.query(

        "SELECT * FROM hotel_charges WHERE status='Active' ORDER BY hotel_type ASC",

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(result);

        }

    );

});

// ======================================
// ADD HOTEL
// ======================================

app.post("/api/hotel-charges",(req,res)=>{

    const{

        hotel_type,

        charge,

        status

    }=req.body;

    db.query(

        `

        INSERT INTO hotel_charges

        (hotel_type,charge,status)

        VALUES (?,?,?)

        `,

        [

            hotel_type,

            charge,

            status

        ],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"Hotel Added Successfully"

            });

        }

    );

});

// ======================================
// ADD HOTEL
// ======================================

app.post("/api/hotel-charges",(req,res)=>{

    const{

        hotel_type,

        charge,

        status

    }=req.body;

    db.query(

        `

        INSERT INTO hotel_charges

        (hotel_type,charge,status)

        VALUES (?,?,?)

        `,

        [

            hotel_type,

            charge,

            status

        ],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"Hotel Added Successfully"

            });

        }

    );

});

// ======================================
// DELETE HOTEL
// ======================================

app.delete("/api/hotel-charges/:id",(req,res)=>{

    const id = req.params.id;

    db.query(

        "DELETE FROM hotel_charges WHERE id=?",

        [id],

        (err,result)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                message:"Hotel Deleted Successfully"

            });

        }

    );

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});