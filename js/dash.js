// ==========================================
// DREAM DESTINATIONS
// ADMIN DASHBOARD
// dashboard.js
// ==========================================


// ==========================================
// API BASE URL
// ==========================================

const API_URL = "http://localhost:3000";


// ==========================================
// CURRENT DATE
// ==========================================

function loadCurrentDate() {

    const currentDate =
        document.getElementById("currentDate");

    if (!currentDate) return;

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString("en-IN", {

            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"

        });

}


// ==========================================
// UPDATE HTML ELEMENT
// ==========================================

function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent = value;

}


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboardData() {

    try {

        console.log(
            "📊 Loading Admin Dashboard..."
        );


        const response =
            await fetch(
                `${API_URL}/api/admin/dashboard`
            );


        if (!response.ok) {

            throw new Error(
                `Dashboard API Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "✅ Dashboard Data:",
            data
        );


        // ==================================
        // STATISTICS
        // ==================================

        updateElement(
            "totalUsers",
            data.totalUsers || 0
        );


        updateElement(
            "totalPackages",
            data.totalPackages || 0
        );


        updateElement(
            "totalBookings",
            data.totalBookings || 0
        );


        updateElement(
            "totalRevenue",
            "₹" +
            Number(
                data.totalRevenue || 0
            ).toLocaleString("en-IN")
        );


        // ==================================
        // RECENT BOOKINGS
        // ==================================

        displayRecentBookings(
            data.recentBookings || []
        );


        // ==================================
        // REVENUE CHART
        // ==================================

        createRevenueChart(
            data.monthlyRevenue || []
        );


        // ==================================
        // BOOKING STATUS CHART
        // ==================================

        createBookingChart(
            data.bookingStatus || []
        );


    }

    catch (error) {

        console.error(
            "❌ Dashboard Error:",
            error
        );


        // Show safe default values

        updateElement(
            "totalUsers",
            0
        );


        updateElement(
            "totalPackages",
            0
        );


        updateElement(
            "totalBookings",
            0
        );


        updateElement(
            "totalRevenue",
            "₹0"
        );


        showDashboardError(
            "Unable to load dashboard data."
        );

    }

}


// ==========================================
// RECENT BOOKINGS
// ==========================================

function displayRecentBookings(bookings) {

    const table =
        document.getElementById(
            "bookingTable"
        );


    if (!table) return;


    table.innerHTML = "";


    // ======================================
    // NO BOOKINGS
    // ======================================

    if (
        !Array.isArray(bookings) ||
        bookings.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >

                    No recent bookings found.

                </td>

            </tr>

        `;

        return;

    }


    // ======================================
    // DISPLAY BOOKINGS
    // ======================================

    bookings.forEach(booking => {

        const row =
            document.createElement("tr");


        const bookingId =
            booking.id ||
            booking.booking_id ||
            "-";


        const customer =
            booking.full_name ||
            booking.name ||
            booking.customer_name ||
            "-";


        const packageName =
            booking.package_name ||
            booking.package ||
            "-";


        const destination =
            booking.destination ||
            "-";


        const totalPrice =
            Number(
                booking.total_price ||
                booking.price ||
                0
            );


        row.innerHTML = `

            <td>

                #${bookingId}

            </td>


            <td>

                ${escapeHTML(customer)}

            </td>


            <td>

                ${escapeHTML(packageName)}

            </td>


            <td>

                ${escapeHTML(destination)}

            </td>


            <td>

                ₹${totalPrice.toLocaleString("en-IN")}

            </td>

        `;


        table.appendChild(row);

    });

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// REVENUE CHART
// ==========================================

let revenueChartInstance = null;


function createRevenueChart(monthlyRevenue) {

    const canvas =
        document.getElementById(
            "revenueChart"
        );


    if (!canvas) return;


    // Destroy old chart

    if (revenueChartInstance) {

        revenueChartInstance.destroy();

    }


    const labels =
        Array.isArray(monthlyRevenue)

        ? monthlyRevenue.map(item => {

            return (
                item.month ||
                item.label ||
                ""
            );

        })

        : [];


    const values =
        Array.isArray(monthlyRevenue)

        ? monthlyRevenue.map(item => {

            return Number(
                item.revenue ||
                item.total ||
                item.amount ||
                0
            );

        })

        : [];


    // ======================================
    // CHECK CHART.JS
    // ======================================

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return;

    }


    revenueChartInstance =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Revenue",

                            data:
                                values,

                            borderWidth:
                                2,

                            tension:
                                0.4,

                            fill:
                                false

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: true

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    function(value) {

                                        return "₹" +
                                            Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================
// BOOKING STATUS CHART
// ==========================================

let bookingChartInstance = null;


function createBookingChart(bookingStatus) {

    const canvas =
        document.getElementById(
            "bookingChart"
        );


    if (!canvas) return;


    // Destroy previous chart

    if (bookingChartInstance) {

        bookingChartInstance.destroy();

    }


    const labels =
        Array.isArray(bookingStatus)

        ? bookingStatus.map(item => {

            return (
                item.status ||
                item.label ||
                "Unknown"
            );

        })

        : [];


    const values =
        Array.isArray(bookingStatus)

        ? bookingStatus.map(item => {

            return Number(
                item.count ||
                item.total ||
                0
            );

        })

        : [];


    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return;

    }


    bookingChartInstance =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Bookings",

                            data:
                                values,

                            borderWidth:
                                1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ==========================================
// DASHBOARD ERROR MESSAGE
// ==========================================

function showDashboardError(message) {

    const table =
        document.getElementById(
            "bookingTable"
        );


    if (!table) return;


    table.innerHTML = `

        <tr>

            <td
                colspan="5"
                style="
                    text-align:center;
                    padding:25px;
                "
            >

                ${escapeHTML(message)}

            </td>

        </tr>

    `;

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) return;


    logoutBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            // Remove admin login information

            localStorage.removeItem(
                "adminId"
            );

            localStorage.removeItem(
                "adminName"
            );

            localStorage.removeItem(
                "adminEmail"
            );

            localStorage.removeItem(
                "adminLoggedIn"
            );


            sessionStorage.removeItem(
                "adminId"
            );

            sessionStorage.removeItem(
                "adminName"
            );

            sessionStorage.removeItem(
                "adminEmail"
            );

            sessionStorage.removeItem(
                "adminLoggedIn"
            );


            window.location.href =
                "admin-login.html";

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        function() {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const rows =
                document.querySelectorAll(
                    "#bookingTable tr"
                );


            rows.forEach(row => {

                const text =
                    row.textContent
                        .toLowerCase();


                if (
                    text.includes(search)
                ) {

                    row.style.display =
                        "";

                }

                else {

                    row.style.display =
                        "none";

                }

            });

        }
    );

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 Admin Dashboard Loaded"
        );


        loadCurrentDate();

        setupLogout();

        setupSearch();

        loadDashboardData();

    }
);


// ==========================================
// REFRESH DASHBOARD
// ==========================================

function refreshDashboard() {

    loadDashboardData();

}


// ==========================================
// MODULE LOADED
// ==========================================

console.log(
    "✅ Dream Destinations Admin Dashboard Module Loaded Successfully"
);