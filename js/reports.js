// ======================================
// Dream Destinations
// Reports
// ======================================

// Summary Cards

const totalRevenue = document.getElementById("totalRevenue");

const totalBookings = document.getElementById("totalBookings");

const totalUsers = document.getElementById("totalUsers");

const totalPackages = document.getElementById("totalPackages");

// Table

const recentBookings = document.getElementById("recentBookings");

// ======================================
// LOAD DASHBOARD SUMMARY
// ======================================

function loadDashboard() {

    fetch("http://localhost:3000/api/report/dashboard")

    .then(res => res.json())

    .then(data => {

        totalRevenue.innerText =
            "₹" + Number(data.revenue || 0).toLocaleString();

        totalBookings.innerText =
            data.bookings || 0;

        totalUsers.innerText =
            data.users || 0;

        totalPackages.innerText =
            data.packages || 0;

    })

    .catch(err => {

        console.log(err);

        alert("Unable to load dashboard.");

    });

}

loadDashboard();

// ======================================
// LOAD RECENT BOOKINGS
// ======================================

function loadRecentBookings() {

    fetch("http://localhost:3000/api/report/recent-bookings")

    .then(res => res.json())

    .then(bookings => {

        recentBookings.innerHTML = "";

        bookings.forEach(booking => {

            let statusClass = "pending";

            if (booking.status === "Confirmed") {

                statusClass = "confirmed";

            }

            if (booking.status === "Cancelled") {

                statusClass = "cancelled";

            }

            recentBookings.innerHTML += `

            <tr>

                <td>${booking.id}</td>

                <td>${booking.full_name}</td>

                <td>${booking.destination}</td>

                <td>${new Date(booking.travel_date).toLocaleDateString()}</td>

                <td>₹${Number(booking.total_price).toLocaleString()}</td>

                <td>

                    <span class="status ${statusClass}">

                        ${booking.status}

                    </span>

                </td>

            </tr>

            `;

        });

    })

    .catch(err => {

        console.log(err);

        alert("Unable to load bookings.");

    });

}

loadRecentBookings();



// ======================================
// MONTHLY REVENUE CHART
// ======================================

fetch("http://localhost:3000/api/report/monthly-revenue")

.then(res=>res.json())

.then(data=>{

    new Chart(document.getElementById("revenueChart"),{

        type:"line",

        data:{

            labels:data.labels,

            datasets:[{

                label:"Revenue",

                data:data.values,

                borderColor:"#ff7a00",

                backgroundColor:"rgba(255,122,0,.15)",

                fill:true,

                tension:.4

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

});



// ======================================
// MONTHLY BOOKINGS CHART
// ======================================

fetch("http://localhost:3000/api/report/monthly-bookings")

.then(res=>res.json())

.then(data=>{

    new Chart(document.getElementById("bookingChart"),{

        type:"bar",

        data:{

            labels:data.labels,

            datasets:[{

                label:"Bookings",

                data:data.values,

                backgroundColor:"#ff7a00",

                borderRadius:8

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

});

// ======================================
// BOOKING STATUS PIE CHART
// ======================================

fetch("http://localhost:3000/api/report/status")

.then(res => res.json())

.then(data => {

    new Chart(document.getElementById("statusChart"), {

        type: "pie",

        data: {

            labels: [

                "Pending",

                "Confirmed",

                "Cancelled"

            ],

            datasets: [{

                data: [

                    data.pending,

                    data.confirmed,

                    data.cancelled

                ],

                backgroundColor: [

                    "#f39c12",

                    "#2ecc71",

                    "#e74c3c"

                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

})

.catch(err => {

    console.log(err);

});


// ======================================
// EXPORT BUTTONS
// ======================================

document.getElementById("exportPDF")

.addEventListener("click", () => {

    window.print();

});

document.getElementById("exportExcel")

.addEventListener("click", () => {

    alert("Excel Export will be added in the next update.");

});


// ======================================
// AUTO REFRESH
// ======================================

setInterval(() => {

    loadDashboard();

    loadRecentBookings();

}, 30000);