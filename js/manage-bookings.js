// =============================
// Dummy Booking Data
// =============================

let bookings = [

    {
        id: 1,
        user: "Satish",
        package: "Goa Beach Tour",
        travelDate: "20-Aug-2026",
        persons: 2,
        totalPrice: "₹18,000",
        status: "Pending"
    },

    {
        id: 2,
        user: "Ramesh",
        package: "Kashmir Tour",
        travelDate: "12-Sep-2026",
        persons: 4,
        totalPrice: "₹52,000",
        status: "Confirmed"
    },

    {
        id: 3,
        user: "Suresh",
        package: "Manali Package",
        travelDate: "05-Oct-2026",
        persons: 3,
        totalPrice: "₹36,000",
        status: "Cancelled"
    }

];

// =============================
// Load Table
// =============================
async function loadBookings(){

    const response = await fetch("/api/bookings");

    const bookings = await response.json();
    
    displayBookings(bookings);

    const table = document.getElementById("bookingTable");

    table.innerHTML = "";

    bookings.forEach(booking=>{

        let badge="";

        if(booking.status==="Pending"){

            badge="pending";

        }else if(booking.status==="Confirmed"){

            badge="confirmed";

        }else{

            badge="cancelled";

        }

        table.innerHTML += `

        <tr>

            <td>${booking.id}</td>

            <td>${booking.full_name}</td>

            <td>${booking.package_name}</td>

            <td>${booking.travel_date}</td>

            <td>${booking.adults + booking.children}</td>

            <td>₹${booking.total_price}</td>

            <td>

                <span class="status ${badge}">

                    ${booking.status}

                </span>

            </td>

            <td>

                <button
class="action-btn view-btn"
onclick="viewBooking(${booking.id})">

<i class="fa-solid fa-eye"></i>

</button>

            </td>

<td>

    <button
    class="action-btn view-btn"
    onclick="viewBooking(${booking.id})">

        <i class="fa-solid fa-eye"></i>

    </button>

    <button
    class="action-btn confirm-btn"
    onclick="confirmBooking(${booking.id})">

        <i class="fa-solid fa-check"></i>

    </button>

    <button
    class="action-btn cancel-btn"
    onclick="cancelBooking(${booking.id})">

        <i class="fa-solid fa-xmark"></i>

    </button>

</td>

        </tr>

        `;

    });

}

loadBookings();

// =============================
// Search
// =============================

document.getElementById("searchInput")

.addEventListener("keyup", async function(){

    const keyword = this.value.toLowerCase();

    const response = await fetch("/api/bookings");

    const bookings = await response.json();

    const filtered = bookings.filter(booking =>

        booking.full_name.toLowerCase().includes(keyword)

        ||

        booking.package_name.toLowerCase().includes(keyword)

    );

    displayBookings(filtered);

});


// =============================
// Filter
// =============================

document.getElementById("statusFilter")

.addEventListener("change", async function(){

    const status = this.value;

    const response = await fetch("/api/bookings");

    const bookings = await response.json();

    if(status==="all"){

        displayBookings(bookings);

        return;

    }

    const filtered = bookings.filter(

        booking=>booking.status===status

    );

    displayBookings(filtered);

});


// =============================
// Buttons
// =============================

function viewBooking(id){

    alert("Booking ID : " + id);

}

function confirmBooking(id){

    const booking = bookings.find(

        b => b.id === id

    );

    booking.status = "Confirmed";

    loadBookings();

}

function cancelBooking(id){

    const booking = bookings.find(

        b => b.id === id

    );

    booking.status = "Cancelled";

    loadBookings();

}

const modal=document.getElementById("bookingModal");

const bookingDetails=document.getElementById("bookingDetails");

document.getElementById("closeModal")

.onclick=()=>{

modal.style.display="none";

};

async function viewBooking(id){

const response=await fetch("/api/bookings/"+id);

const booking=await response.json();

bookingDetails.innerHTML=`

<p><strong>Name :</strong> ${booking.full_name}</p>

<p><strong>Email :</strong> ${booking.email}</p>

<p><strong>Mobile :</strong> ${booking.mobile}</p>

<p><strong>Package :</strong> ${booking.package_name}</p>

<p><strong>From :</strong> ${booking.from_city}</p>

<p><strong>Destination :</strong> ${booking.destination}</p>

<p><strong>Travel Date :</strong> ${booking.travel_date}</p>

<p><strong>Return Date :</strong> ${booking.return_date}</p>

<p><strong>Adults :</strong> ${booking.adults}</p>

<p><strong>Children :</strong> ${booking.children}</p>

<p><strong>Transport :</strong> ${booking.transport}</p>

<p><strong>Hotel :</strong> ${booking.hotel}</p>

<p><strong>Total Price :</strong> ₹${booking.total_price}</p>

<p><strong>Status :</strong> ${booking.status}</p>

`;

modal.style.display="flex";

}

async function confirmBooking(id){

    const response = await fetch(

        "/api/bookings/" + id + "/status",

        {

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                status:"Confirmed"

            })

        }

    );

    const data = await response.json();

    alert(data.message);

    loadBookings();

}


async function cancelBooking(id){

    const response = await fetch(

        "/api/bookings/" + id + "/status",

        {

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                status:"Cancelled"

            })

        }

    );

    const data = await response.json();

    alert(data.message);

    loadBookings();

}

function displayBookings(bookings){

const table=document.getElementById("bookingTable");

table.innerHTML="";

bookings.forEach(booking=>{

let badge="";

if(booking.status==="Pending"){

badge="pending";

}else if(booking.status==="Confirmed"){

badge="confirmed";

}else{

badge="cancelled";

}

table.innerHTML+=`

<tr>

<td>${booking.id}</td>

<td>${booking.full_name}</td>

<td>${booking.package_name}</td>

<td>${booking.travel_date}</td>

<td>${booking.adults + booking.children}</td>

<td>₹${booking.total_price}</td>

<td>

<span class="status ${badge}">

${booking.status}

</span>

</td>

<td>

<button
class="action-btn view-btn"
onclick="viewBooking(${booking.id})">

<i class="fa-solid fa-eye"></i>

</button>

<button
class="action-btn confirm-btn"
onclick="confirmBooking(${booking.id})">

<i class="fa-solid fa-check"></i>

</button>

<button
class="action-btn cancel-btn"
onclick="cancelBooking(${booking.id})">

<i class="fa-solid fa-xmark"></i>

</button>

</td>

</tr>

`;

});

}
