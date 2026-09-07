const fs = require("fs");
const multer = require("multer");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const checkLogin = require("./middleware/auth");

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

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
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/booking.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "booking.html"));
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const db = connection;

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL");
    }
});


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
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

                db.query(
    `SELECT IFNULL(SUM(total_price), 0) AS totalRevenue
     FROM bookings
     WHERE status = 'Confirmed'`,
    (err, revenue) => {

                    if(err) return res.status(500).json(err);

                    dashboard.totalRevenue = revenue[0].totalRevenue;

                    res.json(dashboard);

                });

            });

        });

    });

});


// ==========================================
// RAZORPAY - CREATE PAYMENT ORDER
// ==========================================

app.post("/api/payment/create-order", async (req, res) => {

    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).json({
            success: false,
            message: "Booking ID is required"
        });
    }

    try {

        // Get booking amount from database
        const sql = `
            SELECT
                id,
                total_price,
                status
            FROM bookings
            WHERE id = ?
        `;

        db.query(sql, [bookingId], async (err, result) => {

            if (err) {

                console.error(
                    "Payment Booking Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            const booking = result[0];

            // Don't allow payment for cancelled booking
            if (
                String(booking.status)
                    .toLowerCase() === "cancelled"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Cancelled booking cannot be paid"
                });
            }

            const amount = Number(
                booking.total_price
            );

            if (!amount || amount <= 0) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid booking amount"
                });
            }

            // Razorpay amount is in paise
            const options = {

                amount: Math.round(
                    amount * 100
                ),

                currency: "INR",

                receipt:
                    `booking_${bookingId}`

            };

            const order =
                await razorpay.orders.create(
                    options
                );

            res.json({

                success: true,

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                bookingId:
                    bookingId

            });

        });

    }

    catch (error) {

        console.error(
            "Razorpay Order Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to create payment order"

        });

    }

});

// ==========================================
// RAZORPAY - VERIFY PAYMENT
// ==========================================

app.post("/api/payment/verify", (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        bookingId
    } = req.body;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !bookingId
    ) {
        return res.status(400).json({
            success: false,
            message: "Payment details are required"
        });
    }

    try {

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });

        }


        // ==================================
        // PAYMENT VERIFIED
        // ==================================

        const sql = `
            UPDATE bookings
            SET
                payment_status = ?,
                payment_id = ?,
                razorpay_order_id = ?,
                status = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                "Paid",
                razorpay_payment_id,
                razorpay_order_id,
                "Confirmed",
                bookingId
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Payment Database Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message: "Booking not found"
                    });

                }


                res.json({

                    success: true,

                    message:
                        "Payment successful",

                    paymentId:
                        razorpay_payment_id,

                    bookingId:
                        bookingId

                });

            }
        );

    }

    catch (error) {

        console.error(
            "Payment Verification Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Payment verification error"

        });

    }

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

// ==========================================
// REGISTER USER
// ==========================================

// ==========================================
// REGISTER USER
// ==========================================

// ==========================================
// REGISTER USER
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            address
        } = req.body;


        if (
            !name ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All required fields are required"

            });

        }


        // CHECK EXISTING EMAIL

        const checkSql = `

            SELECT id

            FROM users

            WHERE email = ?

        `;


        db.query(
            checkSql,
            [email],
            async (err, result) => {

                if (err) {

                    console.log(
                        "Check User Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (result.length > 0) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "Email already registered"

                    });

                }


                // HASH PASSWORD

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // INSERT USER

                const insertSql = `

                    INSERT INTO users
                    (
                        email,
                        password,
                        name,
                        phone,
                        status,
                        address
                    )

                    VALUES (?, ?, ?, ?, ?, ?)

                `;


                db.query(
                    insertSql,
                    [
                        email,
                        hashedPassword,
                        name,
                        phone,
                        "Active",
                        address || null
                    ],
                    (err, result) => {

                        if (err) {

                            console.log(
                                "Register Insert Error:",
                                err
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Unable to register user"

                            });

                        }


                        res.status(201).json({

                            success: true,

                            message:
                                "Registration successful",

                            user: {

                                id:
                                    result.insertId,

                                name:
                                    name,

                                email:
                                    email,

                                phone:
                                    phone

                            }

                        });

                    }
                );

            }
        );

    }

    catch (error) {

        console.log(
            "Register Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server Error"

        });

    }

});

// ==========================================
// LOGIN USER
// ==========================================
// ==========================================
// LOGIN USER
// ==========================================

// ==========================================
// LOGIN USER
// ==========================================

app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT
            id,
            email,
            password,
            name,
            phone,
            status,
            address,
            profile_photo
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [email],
        async (err, result) => {

            if (err) {

                console.log(
                    "Login Database Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            if (result.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            const user = result[0];

            // CHECK ACCOUNT STATUS

            if (
                user.status &&
                user.status.toLowerCase() !== "active"
            ) {

                return res.status(403).json({
                    success: false,
                    message: "Your account is not active"
                });

            }

            // CHECK PASSWORD

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            // SUCCESS

            res.json({

                success: true,

                message: "Login successful",

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email,

                    phone: user.phone,

                    address: user.address,

                    profilePhoto:
                        user.profile_photo

                }

            });

        }
    );

});

// ==========================================
// GET USER BOOKINGS
// ==========================================

app.get("/api/users/:id/bookings", (req, res) => {

    const userId = req.params.id;

    const sql = `

        SELECT

            bookings.*,

            packages.package_name,
            packages.destination

        FROM bookings

        INNER JOIN packages

        ON bookings.package_id = packages.id

        WHERE bookings.user_id = ?

        ORDER BY bookings.id DESC

    `;


    db.query(
        sql,
        [userId],
        (err, result) => {

            if (err) {

                console.log(
                    "User Bookings Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            res.json(result);

        }
    );

});
// ==========================================
// UPDATE USER PROFILE
// ==========================================

// ==========================================
// UPDATE USER PROFILE
// ==========================================

app.put("/api/users/:id", (req, res) => {

    const userId = req.params.id;

    const {
        name,
        phone,
        address
    } = req.body;


    if (!name || !phone) {

        return res.status(400).json({

            success: false,

            message:
                "Name and phone are required"

        });

    }


    const sql = `
        UPDATE users
        SET
            name = ?,
            phone = ?,
            address = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [
            name,
            phone,
            address || null,
            userId
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "Update Profile Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            res.json({

                success: true,

                message:
                    "Profile updated successfully"

            });

        }
    );

});

// ==========================================
// MANAGE USERS APIs
// ==========================================


// ==========================================
// GET ALL USERS
// ==========================================

app.get("/api/users", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            status,
            address,
            created_at
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log("Get Users Error:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json(result);

    });

});


// ==========================================
// GET SINGLE USER
// ==========================================

app.get("/api/users/:id", (req, res) => {

    const userId = req.params.id;

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            status,
            address,
            created_at
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        (err, result) => {

            if (err) {

                console.log(
                    "Get User Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            if (result.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }

            res.json(result[0]);

        }
    );

});


// ==========================================
// UPDATE USER STATUS
// ==========================================

app.put("/api/users/:id/status", (req, res) => {

    const userId = req.params.id;

    const { status } = req.body;


    if (
        status !== "Active" &&
        status !== "Blocked"
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid user status"

        });

    }


    const sql = `
        UPDATE users
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [
            status,
            userId
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "Update User Status Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            res.json({

                success: true,

                message:
                    `User ${status === "Blocked"
                        ? "blocked"
                        : "activated"
                    } successfully`

            });

        }
    );

});

app.put("/api/profile/update", (req, res) => {

    const {
        userId,
        name,
        phone,
        address
    } = req.body;


    // ======================================
    // VALIDATION
    // ======================================

    if (!userId) {

        return res.status(400).json({

            success: false,

            message:
                "User ID is required"

        });

    }


    if (!name || !name.trim()) {

        return res.status(400).json({

            success: false,

            message:
                "Name is required"

        });

    }


    if (!phone || !phone.trim()) {

        return res.status(400).json({

            success: false,

            message:
                "Phone number is required"

        });

    }


    // ======================================
    // UPDATE USER
    // ======================================

    const sql = `

        UPDATE users

        SET
            name = ?,
            phone = ?,
            address = ?

        WHERE id = ?

    `;


    db.query(

        sql,

        [
            name.trim(),
            phone.trim(),
            address ? address.trim() : "",
            userId
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Profile Update Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                success: true,

                message:
                    "Profile updated successfully"

            });

        }

    );

});



// ==========================================
// DELETE USER
// ==========================================

app.delete("/api/users/:id", (req, res) => {

    const userId = req.params.id;


    const sql = `
        DELETE FROM users
        WHERE id = ?
    `;


    db.query(
        sql,
        [userId],
        (err, result) => {

            if (err) {

                console.log(
                    "Delete User Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            res.json({

                success: true,

                message:
                    "User deleted successfully"

            });

        }
    );

});

// ==========================================
// GET USER PROFILE
// ==========================================

app.get("/api/profile/:userId", (req, res) => {

    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            address,
            profile_photo,
            status
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        (err, result) => {

            if (err) {

                console.error(
                    "Get Profile Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            if (result.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }

            const user = result[0];

            res.json({

                success: true,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email,

                    phone: user.phone,

                    address: user.address,

                    profilePhoto:
                        user.profile_photo,

                    status:
                        user.status

                }

            });

        }
    );

});

// ==========================================
// WISHLIST - ADD
// ==========================================

app.post("/api/wishlist/add", (req, res) => {

    const {
        userId,
        packageId
    } = req.body;

    if (!userId || !packageId) {

        return res.status(400).json({
            success: false,
            message: "User ID and Package ID are required"
        });

    }

    const sql = `
        INSERT INTO wishlist
        (
            user_id,
            package_id
        )
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            packageId
        ],
        (err, result) => {

            if (err) {

                // Already liked
                if (err.code === "ER_DUP_ENTRY") {

                    return res.json({
                        success: true,
                        message: "Already in wishlist"
                    });

                }

                console.error(
                    "Wishlist Add Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Added to wishlist"
            });

        }
    );

});


// ==========================================
// WISHLIST - REMOVE
// ==========================================

app.delete("/api/wishlist/remove", (req, res) => {

    const {
        userId,
        packageId
    } = req.body;

    if (!userId || !packageId) {

        return res.status(400).json({
            success: false,
            message: "User ID and Package ID are required"
        });

    }

    const sql = `
        DELETE FROM wishlist
        WHERE user_id = ?
        AND package_id = ?
    `;

    db.query(
        sql,
        [
            userId,
            packageId
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Wishlist Remove Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Removed from wishlist"
            });

        }
    );

});


// ==========================================
// GET USER WISHLIST
// ==========================================

app.get(
    "/api/wishlist/:userId",
    (req, res) => {

        const userId =
            req.params.userId;

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });

        }

        const sql = `

            SELECT

                w.id AS wishlist_id,

                p.id AS package_id,

                p.package_name,

                p.destination,

                p.category,

                p.base_price,

                p.image

            FROM wishlist w

            INNER JOIN packages p
                ON w.package_id = p.id

            WHERE w.user_id = ?

            ORDER BY w.created_at DESC

        `;

        db.query(
            sql,
            [userId],
            (err, result) => {

                if (err) {

                    console.error(
                        "Get Wishlist Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });

                }

                res.json({

                    success: true,

                    wishlist:
                        result

                });

            }
        );

    }
);

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

// ======================================
// GET SINGLE PACKAGE
// ======================================

app.get("/api/packages/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM packages WHERE id = ?",
        [id],
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

// ==========================================
// CREATE BOOKING
// ==========================================

app.post("/api/bookings", (req, res) => {

    const {

        user_id,

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

        total_price

    } = req.body;


    // Check user

    if (!user_id) {

        return res.status(401).json({

            success: false,

            message: "User login required"

        });

    }


    // Check package

    if (!package_id) {

        return res.status(400).json({

            success: false,

            message: "Package ID is required"

        });

    }


    const sql = `

        INSERT INTO bookings (

            user_id,

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

            total_price,

            status

        )

        VALUES (

            ?, ?, ?, ?, ?, ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?,
            ?

        )

    `;


    const values = [

        user_id,

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

        total_price,

        "Pending"

    ];


    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.log(
                    "Booking Insert Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            res.json({

                success: true,

                message:
                    "Booking created successfully",

                bookingId:
                    result.insertId

            });

        }
    );

});

// ==========================================
// GET ALL BOOKINGS
// ==========================================

app.get("/api/bookings", (req, res) => {

    const sql = `

        SELECT

            bookings.id,
            bookings.full_name,

            packages.package_name,
            packages.destination,
            packages.image,

            bookings.travel_date,
            bookings.return_date,

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

            console.log(
                "Get Bookings Error:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    "Database Error"

            });

        }


        res.json(result);

    });

});

// ==========================================
// GET SINGLE BOOKING DETAILS
// ==========================================

app.get("/api/bookings/:id", (req, res) => {

    const id = req.params.id;

    const sql = `

        SELECT

            bookings.*,

            packages.package_name,
            packages.destination,
            packages.category,
            packages.base_price,
            packages.image,
            packages.description,
            packages.duration

        FROM bookings

        INNER JOIN packages

        ON bookings.package_id = packages.id

        WHERE bookings.id = ?

    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(
                    "Booking Details Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (result.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking Not Found"

                });

            }


            res.json({

                success: true,

                booking: result[0]

            });

        }
    );

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

// ==========================================
// CANCEL BOOKING
// ==========================================

app.put(
    "/api/bookings/:id/cancel",
    (req, res) => {

        const bookingId =
            req.params.id;


        const sql = `
            UPDATE bookings

            SET status = 'Cancelled'

            WHERE id = ?
        `;


        db.query(
            sql,
            [bookingId],
            (err, result) => {

                if (err) {

                    console.log(
                        "Cancel Booking Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Booking not found"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Booking cancelled successfully"

                });

            }
        );

    }
);

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
image,
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

// ======================================
// GET ALL EXTRA SERVICES
// ======================================

app.get("/api/extra-services", (req, res) => {

    db.query(
        "SELECT * FROM extra_services ORDER BY service_name ASC",
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch extra services",
                    error: err.message
                });
            }

            res.json(result);

        }
    );

});


// ======================================
// GET ACTIVE EXTRA SERVICES
// ======================================

app.get("/api/extra-services/active", (req, res) => {

    db.query(
        "SELECT * FROM extra_services WHERE status='Active' ORDER BY service_name ASC",
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch active services",
                    error: err.message
                });
            }

            res.json(result);

        }
    );

});


// ======================================
// ADD EXTRA SERVICE
// ======================================

app.post("/api/extra-services", (req, res) => {

    const {
        service_name,
        charge,
        charge_type,
        status
    } = req.body;

    if (!service_name || charge === undefined || !charge_type) {

        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });

    }

    db.query(

        `
        INSERT INTO extra_services
        (service_name, charge, charge_type, status)
        VALUES (?, ?, ?, ?)
        `,

        [
            service_name,
            charge,
            charge_type,
            status || "Active"
        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Unable to add service",
                    error: err.message
                });

            }

            res.json({

                success: true,

                message: "Extra Service Added Successfully",

                serviceId: result.insertId

            });

        }

    );

});

// ======================================
// UPDATE EXTRA SERVICE
// ======================================

app.put("/api/extra-services/:id", (req, res) => {

    const id = req.params.id;

    const {
        service_name,
        charge,
        charge_type,
        status
    } = req.body;

    if (!service_name || charge === undefined || !charge_type) {

        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });

    }

    db.query(

        `
        UPDATE extra_services

        SET
            service_name = ?,
            charge = ?,
            charge_type = ?,
            status = ?

        WHERE id = ?
        `,

        [
            service_name,
            charge,
            charge_type,
            status || "Active",
            id
        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Unable to update service",
                    error: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Extra Service not found"
                });

            }

            res.json({

                success: true,

                message: "Extra Service Updated Successfully"

            });

        }

    );

});


// ======================================
// DELETE EXTRA SERVICE
// ======================================

app.delete("/api/extra-services/:id", (req, res) => {

    const id = req.params.id;

    db.query(

        "DELETE FROM extra_services WHERE id = ?",

        [id],

        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Unable to delete service",
                    error: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Extra Service not found"
                });

            }

            res.json({

                success: true,

                message: "Extra Service Deleted Successfully"

            });

        }

    );

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});