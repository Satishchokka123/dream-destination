// ==========================================
// DREAM DESTINATIONS
// payment.js
// ==========================================

const API_BASE = "http://localhost:3000";

// ==========================================
// GET BOOKING ID FROM URL
// ==========================================

const params = new URLSearchParams(
    window.location.search
);

const bookingId = params.get("bookingId");


// ==========================================
// DOM ELEMENTS
// ==========================================

const payButton =
    document.getElementById("paySecureBtn");

const paymentMessage =
    document.getElementById("paymentMessage");


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!bookingId) {

            showMessage(
                "Booking ID not found.",
                "error"
            );

            if (payButton) {
                payButton.disabled = true;
            }

            return;
        }

        // Show booking ID immediately
        setText(
            "bookingId",
            "#" + bookingId
        );

        // Load booking details
        loadBookingDetails();

    }
);


// ==========================================
// LOAD BOOKING DETAILS
// ==========================================

async function loadBookingDetails() {

    try {

        showMessage(
            "Loading booking details...",
            "info"
        );

        const response = await fetch(
            `${API_BASE}/api/bookings/${bookingId}`
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load booking details."
            );

        }

        const data =
            await response.json();

        console.log(
            "Booking Details:",
            data
        );


        if (!data.success || !data.booking) {

            throw new Error(
                data.message ||
                "Booking details not found."
            );

        }


        const booking =
            data.booking;


        // ==================================
        // BASIC DETAILS
        // ==================================

        setText(
            "bookingId",
            "#" + booking.id
        );


        setText(
            "packageName",
            booking.package_name ||
            "-"
        );


        setText(
            "summaryPackage",
            booking.package_name ||
            "Travel Package"
        );


        setText(
            "summaryDestination",
            booking.destination ||
            "Destination"
        );


        // ==================================
        // DATES
        // ==================================

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


        // ==================================
        // TRAVELERS
        // ==================================

        const adults =
            Number(
                booking.adults || 0
            );

        const children =
            Number(
                booking.children || 0
            );

        const totalTravelers =
            adults + children;


        let travelerText =
            `${totalTravelers}`;


        if (children > 0) {

            travelerText +=
                ` (${adults} Adults, ${children} Children)`;

        }


        setText(
            "travelers",
            travelerText
        );


        // ==================================
        // PICKUP CITY
        // ==================================

        setText(
            "pickupCity",
            booking.from_city ||
            booking.pickup_city ||
            "-"
        );


        // ==================================
        // PRICE
        // ==================================

        const amount =
            Number(
                booking.total_price || 0
            );


        setText(
            "packageAmount",
            formatCurrency(amount)
        );


        setText(
            "paymentAmount",
            formatCurrency(amount)
        );


        // ==================================
        // CHECK BOOKING STATUS
        // ==================================

        const status =
            String(
                booking.status || "Pending"
            )
            .trim()
            .toLowerCase();


        if (status === "cancelled") {

            showMessage(
                "This booking has been cancelled and cannot be paid.",
                "error"
            );

            if (payButton) {

                payButton.disabled = true;

                payButton.innerHTML =
                    `<i class="fa-solid fa-ban"></i>
                     Booking Cancelled`;

            }

            return;

        }


        // ==================================
        // ALREADY PAID
        // ==================================

        const paymentStatus =
            String(
                booking.payment_status || ""
            )
            .trim()
            .toLowerCase();


        if (paymentStatus === "paid") {

            showMessage(
                "This booking has already been paid.",
                "success"
            );

            if (payButton) {

                payButton.disabled = true;

                payButton.innerHTML =
                    `<i class="fa-solid fa-check"></i>
                     Payment Completed`;

            }

            return;

        }


        // ==================================
        // READY FOR PAYMENT
        // ==================================

        showMessage(
            "Your booking is ready for secure payment.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Load Booking Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load booking details.",
            "error"
        );


        if (payButton) {

            payButton.disabled = true;

        }

    }

}


// ==========================================
// PAY SECURELY BUTTON
// ==========================================

if (payButton) {

    payButton.addEventListener(
        "click",
        startPayment
    );

}


// ==========================================
// START PAYMENT
// ==========================================

async function startPayment() {

    if (!bookingId) {

        showMessage(
            "Booking ID is missing.",
            "error"
        );

        return;

    }


    try {

        payButton.disabled = true;

        payButton.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>
             Creating Secure Payment...`;


        // ==================================
        // CREATE RAZORPAY ORDER
        // ==================================

        const response =
            await fetch(
                `${API_BASE}/api/payment/create-order`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        bookingId:
                            Number(bookingId)

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Create Order Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to create payment order."
            );

        }


        // ==================================
        // OPEN RAZORPAY
        // ==================================

        openRazorpay(data);

    }

    catch (error) {

        console.error(
            "Payment Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to start payment.",
            "error"
        );


        resetPayButton();

    }

}


// ==========================================
// OPEN RAZORPAY CHECKOUT
// ==========================================

function openRazorpay(order) {

    if (
        typeof Razorpay ===
        "undefined"
    ) {

        showMessage(
            "Razorpay failed to load. Please refresh the page.",
            "error"
        );

        resetPayButton();

        return;

    }


    const options = {

        // ==================================
        // RAZORPAY TEST KEY
        // ==================================

        key:
            "rzp_test_TUIfoqyFDZKF1t",


        amount:
            order.amount,


        currency:
            order.currency || "INR",


        name:
            "Dream Destinations",


        description:
            "Travel Package Booking",


        order_id:
            order.orderId,


        // ==================================
        // SUCCESS HANDLER
        // ==================================

        handler:
            async function (response) {

                console.log(
                    "Razorpay Response:",
                    response
                );


                await verifyPayment(
                    response
                );

            },


        // ==================================
        // PREFILL
        // ==================================

        prefill: {

            name:
                localStorage.getItem(
                    "userName"
                ) || "",


            email:
                localStorage.getItem(
                    "userEmail"
                ) || "",


            contact:
                localStorage.getItem(
                    "userMobile"
                ) || ""

        },


        // ==================================
        // THEME
        // ==================================

        theme: {

            color:
                "#ff6b00"

        },


        // ==================================
        // MODAL
        // ==================================

        modal: {

            ondismiss:
                function () {

                    resetPayButton();

                    showMessage(
                        "Payment cancelled.",
                        "info"
                    );

                }

        }

    };


    const razorpay =
        new Razorpay(options);


    razorpay.open();

}


// ==========================================
// VERIFY PAYMENT
// ==========================================

async function verifyPayment(
    paymentResponse
) {

    try {

        payButton.disabled = true;

        payButton.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>
             Verifying Payment...`;


        const response =
            await fetch(
                `${API_BASE}/api/payment/verify`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        razorpay_order_id:
                            paymentResponse
                                .razorpay_order_id,

                        razorpay_payment_id:
                            paymentResponse
                                .razorpay_payment_id,

                        razorpay_signature:
                            paymentResponse
                                .razorpay_signature,

                        bookingId:
                            Number(bookingId)

                    })

                }
            );


        const result =
            await response.json();


        console.log(
            "Payment Verification:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Payment verification failed."
            );

        }


        // ==================================
        // PAYMENT SUCCESS
        // ==================================

        showMessage(
            "Payment successful! Redirecting...",
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    `booking-success.html?bookingId=${bookingId}&paymentId=${encodeURIComponent(
                        paymentResponse.razorpay_payment_id
                    )}`;

            },
            800
        );

    }

    catch (error) {

        console.error(
            "Verification Error:",
            error
        );


        showMessage(
            error.message ||
            "Payment verification failed.",
            "error"
        );


        resetPayButton();

    }

}


// ==========================================
// SET TEXT SAFELY
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        console.warn(
            `Element #${elementId} not found`
        );

        return;

    }


    element.textContent =
        value ?? "-";

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

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
// FORMAT CURRENCY
// ==========================================

function formatCurrency(
    amount
) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )
    );

}


// ==========================================
// PAYMENT MESSAGE
// ==========================================

function showMessage(
    message,
    type = "info"
) {

    if (!paymentMessage) {

        return;

    }


    paymentMessage.textContent =
        message;


    paymentMessage.className =
        `payment-message ${type}`;

}


// ==========================================
// RESET PAY BUTTON
// ==========================================

function resetPayButton() {

    if (!payButton) {

        return;

    }


    payButton.disabled = false;

    payButton.innerHTML =
        `<i class="fa-solid fa-lock"></i>
         Pay Securely`;

}