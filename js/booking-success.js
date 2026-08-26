// ==========================================
// DREAM DESTINATIONS
// booking-success.js
// ==========================================

const API_BASE = "http://localhost:3000";


// ==========================================
// GET BOOKING ID + PAYMENT ID
// ==========================================

const params = new URLSearchParams(
    window.location.search
);

const bookingId = params.get("bookingId");
const paymentIdFromUrl = params.get("paymentId");


// ==========================================
// DOM HELPERS
// ==========================================

function getElement(id) {
    return document.getElementById(id);
}


function setText(id, value) {

    const element = getElement(id);

    if (element) {
        element.textContent =
            value !== undefined &&
            value !== null &&
            value !== ""
                ? value
                : "-";
    }
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(value) {

    const amount = Number(value || 0);

    return "₹" + amount.toLocaleString("en-IN");
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================
// CALCULATE DURATION
// ==========================================

function calculateDuration(
    travelDate,
    returnDate
) {

    if (!travelDate || !returnDate) {
        return "-";
    }

    const start = new Date(travelDate);
    const end = new Date(returnDate);

    if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime())
    ) {
        return "-";
    }

    const difference =
        end.getTime() -
        start.getTime();

    const days =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );

    if (days < 0) {
        return "-";
    }

    return days + " Days";
}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    const loading =
        getElement("loadingMessage");

    if (loading) {
        loading.style.display = "flex";
    }
}


function hideLoading() {

    const loading =
        getElement("loadingMessage");

    if (loading) {
        loading.style.display = "none";
    }
}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showError(message) {

    hideLoading();

    const container =
        document.querySelector(
            ".success-container"
        );

    if (!container) {
        alert(message);
        return;
    }

    container.innerHTML = `

        <section
            style="
                background:#fff;
                border-radius:14px;
                padding:50px 25px;
                text-align:center;
                box-shadow:0 8px 30px rgba(0,0,0,.07);
            "
        >

            <div
                style="
                    width:70px;
                    height:70px;
                    margin:0 auto 20px;
                    border-radius:50%;
                    background:#fef2f2;
                    color:#dc2626;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:30px;
                "
            >

                <i class="fa-solid fa-circle-exclamation"></i>

            </div>

            <h2>
                Unable to Load Booking
            </h2>

            <p
                style="
                    margin:10px 0 25px;
                    color:#6b7280;
                "
            >
                ${escapeHTML(message)}
            </p>

            <button
                onclick="window.location.href='packages.html'"
                style="
                    border:none;
                    background:#ff6b00;
                    color:white;
                    padding:12px 22px;
                    border-radius:8px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                Back to Packages
            </button>

        </section>

    `;
}


// ==========================================
// LOAD BOOKING
// ==========================================

async function loadBooking() {

    if (!bookingId) {

        showError(
            "Booking ID was not found."
        );

        return;
    }


    showLoading();


    try {

        console.log(
            "Loading booking:",
            bookingId
        );


        const response =
            await fetch(
                `${API_BASE}/api/bookings/${bookingId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to find booking."
            );

        }


        const data =
            await response.json();


        console.log(
            "Booking response:",
            data
        );


        /*
         * Your API may return either:
         *
         * booking object directly
         *
         * OR
         *
         * { success:true, booking:{} }
         */

        let booking = data;


        if (
            data &&
            data.booking
        ) {

            booking =
                data.booking;

        }


        if (
            !booking ||
            !booking.id
        ) {

            throw new Error(
                "Invalid booking information received."
            );

        }


        displayBooking(booking);


        hideLoading();

    }

    catch (error) {

        console.error(
            "Booking Load Error:",
            error
        );


        showError(
            error.message ||
            "Unable to load booking details."
        );

    }

}


// ==========================================
// DISPLAY BOOKING
// ==========================================

function displayBooking(booking) {

    // ======================================
    // BOOKING ID
    // ======================================

    setText(
        "bookingId",
        "#" + booking.id
    );


    // ======================================
    // CUSTOMER
    // ======================================

    setText(
        "customerName",
        booking.full_name
    );

    setText(
        "customerEmail",
        booking.email
    );

    setText(
        "customerMobile",
        booking.mobile
    );


    // ======================================
    // PACKAGE
    // ======================================

    setText(
        "packageName",
        booking.package_name
    );

    setText(
        "destination",
        booking.destination
    );


    // ======================================
    // DATES
    // ======================================

    setText(
        "travelDate",
        formatDate(
            booking.travel_date
        )
    );

    setText(
        "returnDate",
        formatDate(
            booking.return_date
        )
    );


    // ======================================
    // TRAVELERS
    // ======================================

    setText(
        "adults",
        booking.adults || 0
    );

    setText(
        "children",
        booking.children || 0
    );


    // ======================================
    // OTHER DETAILS
    // ======================================

    setText(
        "pickupCity",
        booking.from_city ||
        booking.pickup_city
    );

    setText(
        "transport",
        booking.transport
    );

    setText(
        "hotel",
        booking.hotel
    );


    setText(
        "duration",
        calculateDuration(
            booking.travel_date,
            booking.return_date
        )
    );


    // ======================================
    // AMOUNT
    // ======================================

    const amount =
        Number(
            booking.total_price || 0
        );


    setText(
        "packageAmount",
        formatMoney(amount)
    );

    setText(
        "totalAmount",
        formatMoney(amount)
    );


    // ======================================
    // BOOKING STATUS
    // ======================================

    setText(
        "bookingStatus",
        booking.status ||
        "Confirmed"
    );


    // ======================================
    // PAYMENT STATUS
    // ======================================

    setText(
        "paymentStatus",
        booking.payment_status ||
        "Paid"
    );

    setText(
        "paymentStatusDetails",
        booking.payment_status ||
        "Paid"
    );


    // ======================================
    // PAYMENT ID
    // ======================================

    const paymentId =
        booking.payment_id ||
        paymentIdFromUrl ||
        "-";


    setText(
        "paymentId",
        paymentId
    );

    setText(
        "paymentIdDetails",
        paymentId
    );

    setText(
        "transactionId",
        paymentId
    );


    // ======================================
    // RAZORPAY ORDER ID
    // ======================================

    setText(
        "razorpayOrderId",
        booking.razorpay_order_id
    );


    // ======================================
    // PACKAGE IMAGE
    // ======================================

    setPackageImage(booking);


    // ======================================
    // SAVE BOOKING LOCALLY FOR ACCOUNT UI
    // ======================================

    saveBookingForAccount(
        booking
    );
}


// ==========================================
// PACKAGE IMAGE
// ==========================================

function setPackageImage(booking) {

    const image =
        getElement("packageImage");

    if (!image) {
        return;
    }


    if (!booking.image) {
        return;
    }


    let imagePath =
        booking.image;


    /*
     * If database contains only filename,
     * change this path according to your
     * project package image folder.
     */

    if (
        !imagePath.startsWith("http") &&
        !imagePath.startsWith("/")
    ) {

        imagePath =
            "../uploads/" +
            imagePath;

    }


    image.src = imagePath;

    image.style.display = "block";


    image.onerror = function() {

        image.style.display = "none";

    };
}


// ==========================================
// SAVE BOOKING FOR ACCOUNT UI
// ==========================================

function saveBookingForAccount(
    booking
) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "myBookings"
                ) || "[]"
            );


        const index =
            existing.findIndex(
                item =>
                    Number(item.id) ===
                    Number(booking.id)
            );


        if (index >= 0) {

            existing[index] =
                booking;

        }

        else {

            existing.push(
                booking
            );

        }


        localStorage.setItem(
            "myBookings",
            JSON.stringify(existing)
        );


    }

    catch (error) {

        console.error(
            "Unable to save booking locally:",
            error
        );

    }
}


// ==========================================
// PRINT BOOKING
// ==========================================

const printButton =
    getElement(
        "printBookingBtn"
    );


if (printButton) {

    printButton.addEventListener(
        "click",
        function() {

            window.print();

        }
    );

}


// ==========================================
// MY ACCOUNT
// ==========================================

const accountButton =
    getElement(
        "accountBtn"
    );


if (accountButton) {

    accountButton.addEventListener(
        "click",
        function() {

            /*
             * Change this path if your
             * account page has another name.
             */

            window.location.href =
                "my-account.html";

        }
    );

}


// ==========================================
// HOME
// ==========================================

const homeButton =
    getElement(
        "homeBtn"
    );


if (homeButton) {

    homeButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadBooking();

    }
);


console.log(
    "✅ Booking Success Module Loaded"
);