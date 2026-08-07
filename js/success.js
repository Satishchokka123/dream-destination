// ==========================================
// Dream Destinations - success.js
// ==========================================

// Booking ID from URL

const params = new URLSearchParams(window.location.search);

const bookingId = params.get("bookingId");

// Load Booking Details

fetch("http://localhost:3000/api/bookings/" + bookingId)

.then(response => response.json())

.then(data => {

    document.getElementById("bookingId").textContent =
    data.id;

    document.getElementById("customerName").textContent =
    data.full_name;

    document.getElementById("destination").textContent =
    data.destination;

    document.getElementById("travelDate").textContent =
    data.travel_date;

    document.getElementById("totalAmount").textContent =
    "₹" + data.total_price;

    document.getElementById("paymentStatus").textContent =
    data.payment_status || "Pending";

})

.catch(error => {

    console.log(error);

    alert("Unable to load booking details.");

});