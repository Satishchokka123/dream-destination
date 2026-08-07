// ==========================================
// Dream Destinations - payment.js
// ==========================================

// Get Booking ID
const params = new URLSearchParams(window.location.search);

const bookingId = params.get("bookingId");

// Load Booking Details

fetch("http://localhost:3000/api/bookings/" + bookingId)

.then(res => res.json())

.then(data => {

    document.getElementById("packageName").textContent =
        data.destination + " Tour";

    document.getElementById("destination").textContent =
        data.destination;

    document.getElementById("travellers").textContent =
        data.adults + " Adult(s), " +
        data.children + " Child(ren)";

    document.getElementById("totalAmount").textContent =
        "₹" + data.total_price;

})

.catch(err => {

    console.log(err);

});
// ==========================================
// Razorpay Payment
// ==========================================

document.getElementById("payNow").addEventListener("click", function () {

    const amount = Number(
        document.getElementById("totalAmount")
        .textContent
        .replace("₹", "")
    );

    const options = {

        key: "YOUR_RAZORPAY_KEY_ID",

        amount: amount * 100,

        currency: "INR",

        name: "Dream Destinations",

        description: "Tour Package Booking",

        handler: function (response) {

            alert("Payment Successful!");

            window.location.href =
            "success.html?bookingId=" + bookingId;

        },

        theme: {
            color: "#2563eb"
        }

    };

    const rzp = new Razorpay(options);

    rzp.open();

});