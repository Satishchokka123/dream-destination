// ======================================
// Dream Destinations
// booking.js
// ======================================

// Package ID

const params = new URLSearchParams(window.location.search);

const packageId = params.get("id");

let packageData = {};

let packagePrice = 0;

// ======================================
// Load Package
// ======================================

async function loadPackage() {

    try {

        const response = await fetch(

            `http://localhost:3000/api/packages/${packageId}`

        );

        if (!response.ok) {

            throw new Error("Package Not Found");

        }

        packageData = await response.json();

        packagePrice = Number(packageData.base_price);

        document.getElementById("packageImage").src =
        `http://localhost:3000/images/packages/${packageData.image}`;

        document.getElementById("packageName").innerText =
        packageData.package_name;

        document.getElementById("packageCategory").innerText =
        packageData.category;

        document.getElementById("packageDestination").innerText =
        packageData.destination;

        document.getElementById("packageDuration").innerText =
        packageData.duration;

        document.getElementById("packagePrice").innerText =
        packagePrice.toLocaleString();

        document.getElementById("summaryPackagePrice").innerText =
        packagePrice.toLocaleString();

        calculateTotal();

    }

    catch(err){

        console.log(err);

        alert("Package Not Found");

        window.location.href="package.html";

    }

}

// ======================================
// Total Price
// ======================================

function calculateTotal(){

    const adults = Number(document.getElementById("adults").value) || 0;
    const children = Number(document.getElementById("children").value) || 0;

    const transport = document.getElementById("transport").value;
    const hotel = document.getElementById("hotel").value;

    const breakfast = document.getElementById("breakfast").checked;
    const pickup = document.getElementById("pickup").checked;
    const sightseeing = document.getElementById("sightseeing").checked;
    const insurance = document.getElementById("insurance").checked;

    let total = 0;

    // Package Price
    total += adults * packagePrice;
    total += children * (packagePrice * 0.5);

    let transportCharge = 0;

total += transportCharge;


document.getElementById("transportCharge").innerText =
transportCharge.toLocaleString();

    let hotelCharge = 0;

total += hotelCharge;

document.getElementById("hotelCharge").innerText =
hotelCharge.toLocaleString();

    let serviceCharge = 0;

if(breakfast){

    serviceCharge += (adults + children) * 300;

}

if(sightseeing){

    serviceCharge += 1500;

}

if(insurance){

    serviceCharge += (adults + children) * 500;

}

total += serviceCharge;

document.getElementById("serviceCharge").innerText =
serviceCharge.toLocaleString();

    if(sightseeing){
        total += 1500;
    }

    if(insurance){
        total += (adults + children) * 500;
    }

    document.getElementById("summaryAdults").innerText = adults;
    document.getElementById("summaryChildren").innerText = children;
    document.getElementById("summaryPackagePrice").innerText = packagePrice.toLocaleString();
    document.getElementById("totalPrice").innerText = total.toLocaleString();
}


// ======================================
// LOAD PICKUP CITIES
// ======================================

let pickupCharge = 0;

async function loadPickupCities(){

    try{

        const response = await fetch(

            "http://localhost:3000/api/pickup-cities/active"

        );

        const cities = await response.json();

        const select = document.getElementById("from_city");

        select.innerHTML =

        `<option value="">Select Pickup City</option>`;

        cities.forEach(city=>{

            select.innerHTML += `

            <option

            value="${city.city_name}"

            data-charge="${city.charge}">

            ${city.city_name}

            </option>

            `;

        });




      document.getElementById("from_city")

.addEventListener("change", function(){

    const option = this.options[this.selectedIndex];

    pickupCharge = Number(option.dataset.charge || 0);

    document.getElementById("pickupCharge").innerText =
    pickupCharge.toLocaleString();

    calculateTotal();

});

    }

    catch(err){

        console.log(err);

    }

}

let transportCharge = 0;

async function loadTransport(){

    try{

        const response = await fetch(
            "http://localhost:3000/api/transport-charges/active"
        );

        const transports = await response.json();

        const select = document.getElementById("transport");

        select.innerHTML =
        `<option value="">Select Transport</option>`;

        transports.forEach(item=>{

            select.innerHTML += `

            <option
            value="${item.transport_name}"
            data-charge="${item.charge}">

            ${item.transport_name}

            </option>

            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

document.getElementById("transport")

.addEventListener("change", function(){

    const option = this.options[this.selectedIndex];

    transportCharge = Number(option.dataset.charge || 0);

    document.getElementById("transportCharge").innerText =
    transportCharge.toLocaleString();

    calculateTotal();

});

// ======================================
// LOAD HOTELS
// ======================================

let hotelCharge = 0;

async function loadHotels(){

    try{

        const response = await fetch(

            "http://localhost:3000/api/hotel-charges/active"

        );

        const hotels = await response.json();

        const select = document.getElementById("hotel");

        select.innerHTML =

        `<option value="">Select Hotel</option>`;

        hotels.forEach(item=>{

            select.innerHTML += `

            <option

            value="${item.hotel_type}"

            data-charge="${item.charge}">

            ${item.hotel_type}

            </option>

            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

document.getElementById("hotel")

.addEventListener("change",function(){

    const option = this.options[this.selectedIndex];

    hotelCharge = Number(

        option.dataset.charge || 0

    );

    document.getElementById("hotelCharge").innerText =

    hotelCharge.toLocaleString();

    calculateTotal();

});
// ======================================
// BOOKING SUBMIT
// ======================================

document.getElementById("bookingForm")

.addEventListener("submit", async function(e){

    e.preventDefault();

    const booking = {

        package_id: packageId,

        full_name:
        document.getElementById("full_name").value,

        email:
        document.getElementById("email").value,

        mobile:
        document.getElementById("mobile").value,

        gender:
        document.getElementById("gender").value,

        address:
        document.getElementById("address").value,

        from_city:
        document.getElementById("from_city").value,

        destination:
        document.getElementById("destination").value,

        travel_date:
        document.getElementById("travel_date").value,

        return_date:
        document.getElementById("return_date").value,

        adults:
        document.getElementById("adults").value,

        children:
        document.getElementById("children").value,

        transport:
        document.getElementById("transport").value,

        hotel:
        document.getElementById("hotel").value,

        breakfast:
        document.getElementById("breakfast").checked ? 1 : 0,

        pickup:
        document.getElementById("pickup").checked ? 1 : 0,

        sightseeing:
        document.getElementById("sightseeing").checked ? 1 : 0,

        insurance:
        document.getElementById("insurance").checked ? 1 : 0,

        total_price:

        Number(

            document.getElementById("totalPrice")

            .innerText

            .replace(/,/g,"")

        )

    };

    try{

        const response = await fetch(

            "http://localhost:3000/api/bookings",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify(booking)

            }

        );

        const result = await response.json();

        if(result.success){

            alert(

                "🎉 Booking Successful!\n\nBooking ID : "

                + result.bookingId

            );

            window.location.href =

            "booking-success.html?id="

            + result.bookingId;

        }

        else{

            alert("Booking Failed");

        }

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

});

// ======================================
// PAGE LOAD
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadPackage();

    loadPickupCities();

     loadTransport();

     loadHotels();

});