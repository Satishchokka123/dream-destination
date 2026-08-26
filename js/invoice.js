// ==========================================
// DREAM DESTINATIONS
// invoice.js
// ==========================================


// ==========================================
// GET BOOKING ID
// ==========================================

const params =
    new URLSearchParams(window.location.search);

const bookingId =
    params.get("id");


// ==========================================
// LOAD INVOICE
// ==========================================

async function loadInvoice() {

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
            result.booking || result;


        console.log(
            "Invoice Booking:",
            booking
        );


        displayInvoice(booking);

    }

    catch (error) {

        console.error(
            "Invoice Error:",
            error
        );

        alert(
            "Unable to load invoice"
        );

        window.location.href =
            "bookings.html";

    }

}


// ==========================================
// DISPLAY INVOICE
// ==========================================

function displayInvoice(booking) {


    // ======================================
    // BOOKING
    // ======================================

    setText(
        "bookingId",
        booking.id || "-"
    );


    setText(
        "bookingStatus",
        booking.status || "Pending"
    );


    // ======================================
    // CUSTOMER
    // ======================================

    setText(
        "fullName",
        booking.full_name || "-"
    );


    setText(
        "email",
        booking.email || "-"
    );


    setText(
        "mobile",
        booking.mobile || "-"
    );


    setText(
        "address",
        booking.address || "-"
    );


    // ======================================
    // PACKAGE
    // ======================================

    setText(
        "packageName",
        booking.package_name || "-"
    );


    setText(
        "destination",
        booking.destination || "-"
    );


    setText(
        "category",
        booking.category || "-"
    );


    setText(
        "duration",
        booking.duration || "-"
    );


    // ======================================
    // JOURNEY
    // ======================================

    setText(
        "fromCity",
        booking.from_city || "-"
    );


    setText(
        "journeyDestination",
        booking.destination || "-"
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
    // PAYMENT
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
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadInvoice();

    }
);