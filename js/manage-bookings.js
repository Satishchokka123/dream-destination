// ==========================================
// DREAM DESTINATIONS
// manage-bookings.js
// ==========================================

let allBookings = [];

const API_URL = "http://localhost:3000";


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    const table = document.getElementById("bookingTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading bookings...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}/api/bookings`
        );

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        const data = await response.json();

        console.log("Bookings received:", data);

        allBookings = Array.isArray(data)
            ? data
            : [];

        displayBookings(allBookings);

    }

    catch (error) {

        console.error(
            "Booking Load Error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    Unable to load bookings.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// DISPLAY BOOKINGS
// ==========================================

function displayBookings(bookings) {

    const table =
        document.getElementById("bookingTable");

    if (!table) return;

    table.innerHTML = "";


    if (!bookings || bookings.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    No bookings found.
                </td>
            </tr>
        `;

        return;
    }


    bookings.forEach(booking => {

        const status =
            String(
                booking.status || "Pending"
            )
            .trim();


        const statusLower =
            status.toLowerCase();


        const persons =
            Number(booking.adults || 0) +
            Number(booking.children || 0);


        const price =
            Number(
                booking.total_price || 0
            );


        let statusClass = "pending";


        if (statusLower === "confirmed") {

            statusClass = "confirmed";

        }

        else if (
            statusLower === "cancelled"
        ) {

            statusClass = "cancelled";

        }


        table.innerHTML += `

            <tr>

                <!-- ID -->

                <td>
                    #${booking.id}
                </td>


                <!-- USER -->

                <td>

                    <strong>
                        ${escapeHTML(
                            booking.full_name ||
                            "Unknown User"
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            booking.email ||
                            ""
                        )}
                    </small>

                </td>


                <!-- PACKAGE -->

                <td>

                    ${escapeHTML(
                        booking.package_name ||
                        "Unknown Package"
                    )}

                </td>


                <!-- TRAVEL DATE -->

                <td>

                    ${formatDate(
                        booking.travel_date
                    )}

                </td>


                <!-- PERSONS -->

                <td>
                    ${persons}
                </td>


                <!-- PRICE -->

                <td>

                    ₹${price.toLocaleString(
                        "en-IN"
                    )}

                </td>


                <!-- STATUS -->

                <td>

                    <span
                        class="status ${statusClass}"
                    >

                        ${escapeHTML(status)}

                    </span>

                </td>


                <!-- ACTIONS -->

                <td>

                    <div class="action-buttons">

                        <!-- VIEW -->

                        <button
                            class="action-btn view-btn"
                            onclick="viewBooking(${booking.id})"
                            title="View Booking"
                        >

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        ${
                            statusLower === "pending"

                            ? `

                            <button
                                class="action-btn confirm-btn"
                                onclick="updateBookingStatus(
                                    ${booking.id},
                                    'Confirmed'
                                )"
                                title="Confirm Booking"
                            >

                                <i class="fa-solid fa-check"></i>

                            </button>


                            <button
                                class="action-btn cancel-btn"
                                onclick="updateBookingStatus(
                                    ${booking.id},
                                    'Cancelled'
                                )"
                                title="Cancel Booking"
                            >

                                <i class="fa-solid fa-xmark"></i>

                            </button>

                            `

                            : ""
                        }

                    </div>

                </td>

            </tr>

        `;

    });

}


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterBookings() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
                .toLowerCase()
                .trim()
            : "all";


    const filtered =
        allBookings.filter(
            booking => {

                const user =
                    String(
                        booking.full_name || ""
                    )
                    .toLowerCase();


                const packageName =
                    String(
                        booking.package_name || ""
                    )
                    .toLowerCase();


                const status =
                    String(
                        booking.status || ""
                    )
                    .toLowerCase()
                    .trim();


                const searchMatch =
                    search === "" ||
                    user.includes(search) ||
                    packageName.includes(search);


                const statusMatch =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    searchMatch &&
                    statusMatch
                );

            }
        );


    displayBookings(filtered);

}


// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

async function updateBookingStatus(
    bookingId,
    newStatus
) {

    const message =
        newStatus === "Confirmed"

            ? "Confirm this booking?"

            : "Cancel this booking?";


    if (!confirm(message)) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/bookings/${bookingId}/status`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        status: newStatus

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to update booking"
            );

        }


        alert(
            result.message ||
            "Booking status updated successfully."
        );


        // Reload fresh database data

        await loadBookings();


        // Re-apply current search/filter

        filterBookings();

    }

    catch (error) {

        console.error(
            "Status Update Error:",
            error
        );


        alert(
            error.message ||
            "Unable to update booking."
        );

    }

}


// ==========================================
// VIEW BOOKING DETAILS
// ==========================================

async function viewBooking(bookingId) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/bookings/${bookingId}`
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Booking not found"
            );

        }


        const booking =
            result.booking;


        const details =
            document.getElementById(
                "bookingDetails"
            );


        if (!details) return;


        details.innerHTML = `

            <div class="booking-detail-grid">

                <div>
                    <strong>Booking ID</strong>
                    <p>#${booking.id}</p>
                </div>


                <div>
                    <strong>Customer</strong>
                    <p>
                        ${escapeHTML(
                            booking.full_name ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Email</strong>
                    <p>
                        ${escapeHTML(
                            booking.email ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Mobile</strong>
                    <p>
                        ${escapeHTML(
                            booking.mobile ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Package</strong>
                    <p>
                        ${escapeHTML(
                            booking.package_name ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Destination</strong>
                    <p>
                        ${escapeHTML(
                            booking.destination ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>From City</strong>
                    <p>
                        ${escapeHTML(
                            booking.from_city ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Travel Date</strong>
                    <p>
                        ${formatDate(
                            booking.travel_date
                        )}
                    </p>
                </div>


                <div>
                    <strong>Return Date</strong>
                    <p>
                        ${formatDate(
                            booking.return_date
                        )}
                    </p>
                </div>


                <div>
                    <strong>Adults</strong>
                    <p>
                        ${booking.adults || 0}
                    </p>
                </div>


                <div>
                    <strong>Children</strong>
                    <p>
                        ${booking.children || 0}
                    </p>
                </div>


                <div>
                    <strong>Transport</strong>
                    <p>
                        ${escapeHTML(
                            booking.transport ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Hotel</strong>
                    <p>
                        ${escapeHTML(
                            booking.hotel ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <strong>Total Price</strong>
                    <p>
                        ₹${Number(
                            booking.total_price || 0
                        ).toLocaleString("en-IN")}
                    </p>
                </div>


                <div>
                    <strong>Status</strong>
                    <p>

                        <span
                            class="status ${getStatusClass(
                                booking.status
                            )}"
                        >

                            ${escapeHTML(
                                booking.status ||
                                "Pending"
                            )}

                        </span>

                    </p>
                </div>

            </div>

        `;


        const modal =
            document.getElementById(
                "bookingModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }

    }

    catch (error) {

        console.error(
            "View Booking Error:",
            error
        );


        alert(
            error.message ||
            "Unable to load booking details."
        );

    }

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    const value =
        String(status || "")
            .toLowerCase()
            .trim();


    if (value === "confirmed") {
        return "confirmed";
    }


    if (value === "cancelled") {
        return "cancelled";
    }


    return "pending";

}


// ==========================================
// CLOSE MODAL
// ==========================================

const closeModal =
    document.getElementById(
        "closeModal"
    );


if (closeModal) {

    closeModal.addEventListener(
        "click",
        function() {

            const modal =
                document.getElementById(
                    "bookingModal"
                );


            if (modal) {

                modal.style.display =
                    "none";

            }

        }
    );

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "bookingModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


// ==========================================
// SEARCH
// ==========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterBookings
    );

}


// ==========================================
// STATUS FILTER
// ==========================================

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterBookings
    );

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
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadBookings();

    }
);


console.log(
    "✅ Manage Bookings Module Loaded"
);