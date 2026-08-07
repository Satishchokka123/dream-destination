// ======================================
// Dream Destinations
// hotel-charges.js
// ======================================

const API = "http://localhost:3000/api/hotel-charges";

const table = document.getElementById("hotelTable");

const modal = document.getElementById("hotelModal");

const form = document.getElementById("hotelForm");

let hotels = [];

// ======================================
// LOAD HOTELS
// ======================================

async function loadHotels(){

    try{

        const response = await fetch(API);

        hotels = await response.json();

        displayHotels(hotels);

    }

    catch(err){

        console.log(err);

    }

}

// ======================================
// DISPLAY HOTELS
// ======================================

function displayHotels(data){

    table.innerHTML = "";

    data.forEach(hotel=>{

        table.innerHTML += `

        <tr>

            <td>${hotel.id}</td>

            <td>${hotel.hotel_type}</td>

            <td>₹${Number(hotel.charge).toLocaleString()}</td>

            <td>

                <span class="${
                    hotel.status==="Active"
                    ?
                    "status-active"
                    :
                    "status-inactive"
                }">

                    ${hotel.status}

                </span>

            </td>

            <td>

                ${new Date(hotel.created_at)
                .toLocaleDateString()}

            </td>

            <td>

                <button

                class="edit-btn"

                onclick="editHotel(${hotel.id})">

                <i class="fa-solid fa-pen"></i>

                </button>

                <button

                class="delete-btn"

                onclick="deleteHotel(${hotel.id})">

                <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// SEARCH
// ======================================

document.getElementById("searchHotel")

.addEventListener("keyup",function(){

    const value = this.value.toLowerCase();

    const filtered = hotels.filter(hotel=>

        hotel.hotel_type

        .toLowerCase()

        .includes(value)

    );

    displayHotels(filtered);

});

// ======================================
// OPEN MODAL
// ======================================

document.getElementById("addHotelBtn")

.addEventListener("click",()=>{

    form.reset();

    document.getElementById("hotelId").value="";

    document.getElementById("modalTitle").innerText="Add Hotel";

    modal.style.display="flex";

});

// ======================================
// CLOSE MODAL
// ======================================

document.getElementById("closeModal")

.addEventListener("click",()=>{

    modal.style.display="none";

});

window.onclick=function(e){

    if(e.target===modal){

        modal.style.display="none";

    }

}

loadHotels();

// ======================================
// SAVE HOTEL (ADD / UPDATE)
// ======================================

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const id = document.getElementById("hotelId").value;

    const hotel = {

        hotel_type:
        document.getElementById("hotelType").value,

        charge:
        document.getElementById("hotelCharge").value,

        status:
        document.getElementById("hotelStatus").value

    };

    try{

        let response;

        // UPDATE
        if(id){

            response = await fetch(API + "/" + id,{

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(hotel)

            });

        }

        // ADD
        else{

            response = await fetch(API,{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(hotel)

            });

        }

        const result = await response.json();

        alert(result.message);

        modal.style.display = "none";

        loadHotels();

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

});

// ======================================
// EDIT HOTEL
// ======================================

function editHotel(id){

    const hotel = hotels.find(h=>h.id==id);

    if(!hotel) return;

    document.getElementById("modalTitle").innerText =
    "Edit Hotel";

    document.getElementById("hotelId").value =
    hotel.id;

    document.getElementById("hotelType").value =
    hotel.hotel_type;

    document.getElementById("hotelCharge").value =
    hotel.charge;

    document.getElementById("hotelStatus").value =
    hotel.status;

    modal.style.display = "flex";

}

// ======================================
// DELETE HOTEL
// ======================================

async function deleteHotel(id){

    if(!confirm("Are you sure you want to delete this hotel?")){

        return;

    }

    try{

        const response = await fetch(API + "/" + id,{

            method:"DELETE"

        });

        const result = await response.json();

        alert(result.message);

        loadHotels();

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

}