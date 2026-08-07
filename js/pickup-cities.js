// ======================================
// Dream Destinations
// pickup-cities.js
// ======================================

const API = "http://localhost:3000/api/pickup-cities";

const table = document.getElementById("citiesTable");

const modal = document.getElementById("cityModal");

const form = document.getElementById("cityForm");

let cities = [];

// ======================================
// Load Cities
// ======================================

async function loadCities(){

    try{

        const response = await fetch(API);

        cities = await response.json();

        displayCities(cities);

    }

    catch(err){

        console.log(err);

    }

}

// ======================================
// Display Cities
// ======================================

function displayCities(data){

    table.innerHTML = "";

    data.forEach(city=>{

        table.innerHTML += `

        <tr>

            <td>${city.id}</td>

            <td>${city.city_name}</td>

            <td>₹${Number(city.charge).toLocaleString()}</td>

            <td>

                <span class="${
                    city.status==="Active"
                    ?
                    "status-active"
                    :
                    "status-inactive"
                }">

                    ${city.status}

                </span>

            </td>

            <td>

                ${new Date(city.created_at)

                .toLocaleDateString()}

            </td>

            <td>

                <button

                class="edit-btn"

                onclick="editCity(${city.id})">

                <i class="fa-solid fa-pen"></i>

                </button>

                <button

                class="delete-btn"

                onclick="deleteCity(${city.id})">

                <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Search
// ======================================

document.getElementById("searchCity")

.addEventListener("keyup",function(){

    const value = this.value.toLowerCase();

    const filtered = cities.filter(city=>

        city.city_name

        .toLowerCase()

        .includes(value)

    );

    displayCities(filtered);

});

// ======================================
// Open Modal
// ======================================

document.getElementById("addCityBtn")

.addEventListener("click",()=>{

    form.reset();

    document.getElementById("cityId").value="";

    document.getElementById("modalTitle").innerText="Add Pickup City";

    modal.style.display="flex";

});

// ======================================
// Close Modal
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

loadCities();

// ======================================
// SAVE CITY (ADD / UPDATE)
// ======================================

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const id = document.getElementById("cityId").value;

    const city = {

        city_name: document.getElementById("cityName").value,

        charge: document.getElementById("cityCharge").value,

        status: document.getElementById("cityStatus").value

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

                body:JSON.stringify(city)

            });

        }

        // ADD
        else{

            response = await fetch(API,{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(city)

            });

        }

        const result = await response.json();

        alert(result.message);

        modal.style.display="none";

        loadCities();

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

});

// ======================================
// EDIT CITY
// ======================================

function editCity(id){

    const city = cities.find(c=>c.id==id);

    if(!city) return;

    document.getElementById("modalTitle").innerText="Edit Pickup City";

    document.getElementById("cityId").value = city.id;

    document.getElementById("cityName").value = city.city_name;

    document.getElementById("cityCharge").value = city.charge;

    document.getElementById("cityStatus").value = city.status;

    modal.style.display="flex";

}

// ======================================
// DELETE CITY
// ======================================

async function deleteCity(id){

    if(!confirm("Are you sure you want to delete this city?")){

        return;

    }

    try{

        const response = await fetch(API + "/" + id,{

            method:"DELETE"

        });

        const result = await response.json();

        alert(result.message);

        loadCities();

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

}