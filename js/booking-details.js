// ==========================================
// DREAM DESTINATIONS
// booking-details.js
// ==========================================


// ==========================================
// GET BOOKING ID FROM URL
// ==========================================

const params =
    new URLSearchParams(window.location.search);

const bookingId =
    params.get("id");


// ==========================================
// LOAD BOOKING DETAILS
// ==========================================

async function loadBookingDetails() {

    if (!bookingId) {

        alert("Booking ID not found");

        window.location.href =
            "bookings.html";

        return;
    }


    try {

        const response = await fetch(
            `http://localhost:3000/api/bookings/${bookingId}`
        );


        if (!response.ok) {

            throw new Error(
                "Booking not found"
            );

        }


        const result =
    await response.json();


const booking =
    result.booking;


console.log(
    "Booking Details:",
    booking
);


displayBookingDetails(booking);

    }

    catch (error) {

        console.error(
            "Booking Details Error:",
            error
        );

        alert(
            "Booking details not found"
        );

        window.location.href =
            "bookings.html";

    }

}


// ==========================================
// DISPLAY BOOKING DETAILS
// ==========================================

function displayBookingDetails(booking) {


    // ======================================
    // BOOKING ID
    // ======================================

    setText(
        "bookingId",
        `#${booking.id || booking.booking_id || "-"}`
    );


    // ======================================
    // PACKAGE
    // ======================================

    setText(
        "packageName",
        booking.package_name || "Travel Package"
    );


    setText(
        "packageTitle",
        booking.package_name || "Travel Package"
    );


    setText(
        "destination",
        booking.destination || "-"
    );


    setText(
        "journeyDestination",
        booking.destination || "-"
    );


    // ======================================
    // PACKAGE IMAGE
    // ======================================

    const packageImage =
        document.getElementById("packageImage");


    if (booking.image) {

        packageImage.src =
            `http://localhost:3000/images/packages/${booking.image}`;

    }


    packageImage.onerror =
        function () {

            this.src =
                "images/default-package.jpg";

        };


    // ======================================
    // PACKAGE DETAILS
    // ======================================

    setText(
        "packageDescription",
        booking.description ||
        "Enjoy a memorable journey with Dream Destinations."
    );


    setText(
        "duration",
        booking.duration || "-"
    );


    setText(
        "category",
        booking.category || "-"
    );


    // ======================================
    // JOURNEY DETAILS
    // ======================================

    setText(
        "fromCity",
        booking.from_city || "-"
    );


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
    // TRAVELER DETAILS
    // ======================================

    setText(
        "fullName",
        booking.full_name || "-"
    );


    setText(
        "mobile",
        booking.mobile || "-"
    );


    setText(
        "adults",
        booking.adults || 0
    );


    setText(
        "children",
        booking.children || 0
    );


    // ======================================
    // TRAVEL PREFERENCES
    // ======================================

    setText(
        "transport",
        booking.transport || "-"
    );


    setText(
        "hotel",
        booking.hotel || "-"
    );


    setText(
        "pickupCity",
        booking.from_city || "-"
    );


    // ======================================
    // EXTRA SERVICES
    // ======================================

    let services = [];


    if (
        Number(booking.breakfast) === 1
    ) {

        services.push("Breakfast");

    }


    if (
        Number(booking.pickup) === 1
    ) {

        services.push("Pickup");

    }


    if (
        Number(booking.sightseeing) === 1
    ) {

        services.push("Sightseeing");

    }


    if (
        Number(booking.insurance) === 1
    ) {

        services.push("Insurance");

    }


    setText(
        "extraServices",
        services.length
            ? services.join(", ")
            : "No Extra Services"
    );


    // ======================================
    // PRICE DETAILS
    // ======================================

    setMoney(
        "packagePrice",
        booking.package_price ||
        booking.base_price ||
        0
    );


    setMoney(
        "pickupCharge",
        booking.pickup_charge || 0
    );


    setMoney(
        "transportCharge",
        booking.transport_charge || 0
    );


    setMoney(
        "hotelCharge",
        booking.hotel_charge || 0
    );


    setMoney(
        "serviceCharge",
        booking.service_charge || 0
    );


    setMoney(
        "totalPrice",
        booking.total_price || 0
    );


    // ======================================
    // STATUS
    // ======================================

    updateStatus(
        booking.status || "Pending"
    );

}


// ==========================================
// SET TEXT
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            value;

    }

}


// ==========================================
// MONEY FORMAT
// ==========================================

function setMoney(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    const amount =
        Number(value) || 0;


    element.innerText =
        amount.toLocaleString("en-IN");

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    if (!date) {

        return "-";

    }


    const d =
        new Date(date);


    if (isNaN(d.getTime())) {

        return date;

    }


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// UPDATE STATUS
// ==========================================

function updateStatus(status) {

    const element =
        document.getElementById(
            "bookingStatus"
        );


    if (!element) {

        return;

    }


    const value =
        String(status);


    element.innerText =
        value;


    element.className =
        "booking-status " +
        getStatusClass(value);

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase();


    if (value === "confirmed") {

        return "confirmed";

    }


    if (value === "completed") {

        return "completed";

    }


    if (value === "cancelled") {

        return "cancelled";

    }


    return "pending";

}


// ==========================================
// CANCEL BOOKING
// ==========================================

document
    .getElementById("cancelBooking")
    .addEventListener(
        "click",
        cancelBooking
    );


async function cancelBooking() {

    if (!bookingId) {

        return;

    }


    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmCancel) {

        return;

    }


    try {

        const response =
            await fetch(
                `http://localhost:3000/api/bookings/${bookingId}/cancel`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const result =
            await response.json();


        if (result.success) {

            alert(
                "Booking cancelled successfully."
            );


            loadBookingDetails();

        }

        else {

            alert(
                result.message ||
                "Unable to cancel booking."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Server error while cancelling booking."
        );

    }

}


// ==========================================
// VIEW INVOICE
// ==========================================

document
    .getElementById("downloadInvoice")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                `invoice.html?id=${bookingId}`;

        }
    );


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadBookingDetails();

    }
);