// ==========================================
// DREAM DESTINATIONS
// bookings.js
// ==========================================

let allBookings = [];


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    const loadingState =
        document.getElementById("loadingState");

    const emptyState =
        document.getElementById("emptyState");

    const bookingsList =
        document.getElementById("bookingsList");

    try {

        const response = await fetch(
            "http://localhost:3000/api/bookings"
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load bookings"
            );

        }

        const data = await response.json();

        allBookings = Array.isArray(data)
            ? data
            : [];

        loadingState.style.display = "none";

        displayBookings(allBookings);

    }

    catch (error) {

        console.error(
            "Booking Load Error:",
            error
        );

        loadingState.style.display = "none";

        bookingsList.innerHTML = "";

        emptyState.style.display = "flex";

        emptyState.querySelector("h2").innerText =
            "Unable to Load Bookings";

        emptyState.querySelector("p").innerText =
            "Please check your server connection.";

    }

}


// ==========================================
// DISPLAY BOOKINGS
// ==========================================

function displayBookings(bookings) {

    const bookingsList =
        document.getElementById("bookingsList");

    const emptyState =
        document.getElementById("emptyState");

    const bookingCount =
        document.getElementById("bookingCount");


    bookingsList.innerHTML = "";


    bookingCount.innerText =
        bookings.length;


    if (bookings.length === 0) {

        emptyState.style.display = "flex";

        return;

    }


    emptyState.style.display = "none";


    bookings.forEach(booking => {

        const card =
            createBookingCard(booking);

        bookingsList.appendChild(card);

    });

}


// ==========================================
// CREATE BOOKING CARD
// ==========================================

function createBookingCard(booking) {

    const card =
        document.createElement("div");

    card.className =
        "booking-card";


    // --------------------------------------
    // Package Information
    // --------------------------------------

    const packageName =
        booking.package_name ||
        "Travel Package";


    const destination =
        booking.destination ||
        booking.from_city ||
        "Destination";


    const image =
        booking.image
            ? `http://localhost:3000/images/packages/${booking.image}`
            : "images/default-package.jpg";


    // --------------------------------------
    // Booking Information
    // --------------------------------------

    const bookingId =
        booking.id ||
        booking.booking_id ||
        "-";


    const travelDate =
        formatDate(
            booking.travel_date
        );


    const returnDate =
        formatDate(
            booking.return_date
        );


    const status =
        booking.status ||
        "Pending";


    const totalPrice =
        Number(
            booking.total_price || 0
        );


    // --------------------------------------
    // HTML
    // --------------------------------------

    card.innerHTML = `

        <!-- PACKAGE -->

        <div class="booking-package">

            <div class="booking-package-image">

                <img
                    src="${image}"
                    alt="${packageName}"
                    onerror="this.src='images/default-package.jpg'"
                >

            </div>


            <div>

                <h3>
                    ${packageName}
                </h3>

                <p>
                    <i class="fa-solid fa-location-dot"></i>

                    ${destination}
                </p>

                <p>
                    Booking ID:
                    <strong>#${bookingId}</strong>
                </p>

            </div>

        </div>



        <!-- INFORMATION -->

        <div class="booking-info">


            <div class="info-item">

                <label>
                    Travel Date
                </label>

                <span>
                    ${travelDate}
                </span>

            </div>


            <div class="info-item">

                <label>
                    Return Date
                </label>

                <span>
                    ${returnDate}
                </span>

            </div>


            <div class="info-item">

                <label>
                    Travelers
                </label>

                <span>
                    ${booking.adults || 0}
                    Adult(s)
                    +
                    ${booking.children || 0}
                    Child
                </span>

            </div>


            <div class="info-item">

                <label>
                    Status
                </label>

                <span
                    class="booking-status ${getStatusClass(status)}">

                    ${status}

                </span>

            </div>

        </div>



        <!-- ACTION -->

        <div class="booking-action">

            <div class="booking-price">

                ₹${totalPrice.toLocaleString("en-IN")}

            </div>


            <a
                href="booking-details.html?id=${bookingId}"
                class="view-details-btn">

                <i class="fa-solid fa-eye"></i>

                View Details

            </a>

        </div>

    `;


    return card;

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
// SEARCH
// ==========================================

document
    .getElementById("bookingSearch")
    .addEventListener(
        "input",
        applyFilters
    );


// ==========================================
// STATUS FILTER
// ==========================================

document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        applyFilters
    );


// ==========================================
// SORT
// ==========================================

document
    .getElementById("sortBookings")
    .addEventListener(
        "change",
        applyFilters
    );


// ==========================================
// APPLY SEARCH + FILTER + SORT
// ==========================================

function applyFilters() {

    const search =
        document
            .getElementById("bookingSearch")
            .value
            .toLowerCase()
            .trim();


    const status =
        document
            .getElementById("statusFilter")
            .value;


    const sort =
        document
            .getElementById("sortBookings")
            .value;


    // --------------------------------------
    // SEARCH
    // --------------------------------------

    let filtered =
        allBookings.filter(booking => {

            const packageName =
                String(
                    booking.package_name || ""
                ).toLowerCase();


            const destination =
                String(
                    booking.destination || ""
                ).toLowerCase();


            const bookingId =
                String(
                    booking.id ||
                    booking.booking_id ||
                    ""
                ).toLowerCase();


            return (
                packageName.includes(search) ||
                destination.includes(search) ||
                bookingId.includes(search)
            );

        });


    // --------------------------------------
    // STATUS FILTER
    // --------------------------------------

    if (status !== "all") {

        filtered =
            filtered.filter(
                booking =>
                    String(
                        booking.status ||
                        "Pending"
                    ).toLowerCase()
                    ===
                    status.toLowerCase()
            );

    }


    // --------------------------------------
    // SORT
    // --------------------------------------

    if (sort === "latest") {

        filtered.sort(
            (a, b) =>
                Number(
                    b.id ||
                    b.booking_id ||
                    0
                )
                -
                Number(
                    a.id ||
                    a.booking_id ||
                    0
                )
        );

    }


    else if (sort === "oldest") {

        filtered.sort(
            (a, b) =>
                Number(
                    a.id ||
                    a.booking_id ||
                    0
                )
                -
                Number(
                    b.id ||
                    b.booking_id ||
                    0
                )
        );

    }


    else if (sort === "price-high") {

        filtered.sort(
            (a, b) =>
                Number(
                    b.total_price || 0
                )
                -
                Number(
                    a.total_price || 0
                )
        );

    }


    else if (sort === "price-low") {

        filtered.sort(
            (a, b) =>
                Number(
                    a.total_price || 0
                )
                -
                Number(
                    b.total_price || 0
                )
        );

    }


    displayBookings(filtered);

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadBookings();

    }
);

