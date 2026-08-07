// ======================================
// Dream Destinations - Dashboard
// ======================================


// Load Dashboard Statistics

alert("Dashboard JS Loaded");
fetch("http://localhost:3000/api/admin/dashboard")

.then(response => response.json())

.then(data => {

    document.getElementById("totalUsers").textContent =
    data.totalUsers;

    document.getElementById("totalPackages").textContent =
    data.totalPackages;

    document.getElementById("totalBookings").textContent =
    data.totalBookings;

    document.getElementById("totalRevenue").textContent =
    "₹" + Number(data.totalRevenue).toLocaleString();

})

.catch(error => {

    console.log(error);

});



// ======================================
// Recent Bookings
// ======================================

fetch("http://localhost:3000/api/admin/recent-bookings")

.then(response => response.json())

.then(bookings => {

    const table = document.getElementById("bookingTable");

    table.innerHTML = "";

    bookings.forEach(booking => {

        table.innerHTML += `

        <tr>

            <td>${booking.id}</td>

            <td>${booking.full_name}</td>

            <td>${booking.package_name}</td>

            <td>${booking.destination}</td>

            <td>₹${Number(booking.total_price).toLocaleString()}</td>

        </tr>

        `;

    });

})

.catch(error => {

    console.log(error);

});



// ======================================
// Logout
// ======================================

document.getElementById("logoutBtn")

.addEventListener("click", function(){

    if(confirm("Are you sure you want to logout?")){

        window.location.href="admin-login.html";

    }

});
// Current Date

const today = new Date();

document.getElementById("currentDate").textContent =
today.toDateString();

// ===============================
// Revenue Chart
// ===============================

new Chart(document.getElementById("revenueChart"),{

    type:"bar",

    data:{

        labels:["Jan","Feb","Mar","Apr","May","Jun"],

        datasets:[{

            label:"Revenue",

            data:[12000,18000,25000,21000,30000,42000],

            backgroundColor:"#ff7a00"

        }]

    }

});


// ===============================
// Booking Status
// ===============================

new Chart(document.getElementById("bookingChart"),{

    type:"doughnut",

    data:{

        labels:["Confirmed","Pending","Cancelled"],

        datasets:[{

            data:[40,12,6],

            backgroundColor:[

                "#16a34a",

                "#f59e0b",

                "#ef4444"

            ]

        }]

    }

});

// ======================================
// Revenue Chart
// ======================================

fetch("http://localhost:3000/api/admin/revenue-chart")

.then(response => response.json())

.then(data => {

    const months = [];

    const revenue = [];

    const monthNames = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    data.forEach(item => {

        months.push(monthNames[item.month - 1]);

        revenue.push(item.revenue);

    });

    new Chart(document.getElementById("revenueChart"), {

        type: "bar",

        data: {

            labels: months,

            datasets: [{

                label: "Revenue",

                data: revenue,

                backgroundColor: "#ff7a00"

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

})

// ======================================
// Booking Status Chart
// ======================================

fetch("http://localhost:3000/api/admin/booking-status")

.then(response => response.json())

.then(data => {

    const labels = [];

    const values = [];

    const colors = [];

    data.forEach(item => {

        labels.push(item.status);

        values.push(item.total);

        if(item.status === "Confirmed")
            colors.push("#16a34a");

        else if(item.status === "Pending")
            colors.push("#f59e0b");

        else
            colors.push("#ef4444");

    });

    new Chart(document.getElementById("bookingChart"), {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: colors

            }]

        },

        options: {

            responsive: true

        }

    });

})

.catch(error => console.log(error));
.catch(error => console.log(error));