// ======================================
// Dream Destinations
// extra-services.js
// ======================================

const API = "http://localhost:3000/api/extra-services";

const table = document.getElementById("serviceTable");

const modal = document.getElementById("serviceModal");

const form = document.getElementById("serviceForm");

let services = [];


// ======================================
// LOAD SERVICES
// ======================================

async function loadServices(){

    try{

        const response = await fetch(API);

        if(!response.ok){

            throw new Error("Unable to load services");

        }

        services = await response.json();

        displayServices(services);

    }

    catch(error){

        console.error(error);

        table.innerHTML = `

            <tr>

                <td colspan="7">

                    Unable to load services

                </td>

            </tr>

        `;

    }

}


// ======================================
// DISPLAY SERVICES
// ======================================

function displayServices(data){

    table.innerHTML = "";

    if(data.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="7">

                    No Extra Services Found

                </td>

            </tr>

        `;

        return;

    }


    data.forEach(service => {

        const chargeTypeClass =

            service.charge_type === "Per Person"

            ? "charge-person"

            : "charge-fixed";


        table.innerHTML += `

            <tr>

                <td>

                    ${service.id}

                </td>


                <td>

                    ${service.service_name}

                </td>


                <td>

                    ₹${Number(service.charge).toLocaleString()}

                </td>


                <td>

                    <span class="${chargeTypeClass}">

                        ${service.charge_type}

                    </span>

                </td>


                <td>

                    <span class="${
                        service.status === "Active"
                        ? "status-active"
                        : "status-inactive"
                    }">

                        ${service.status}

                    </span>

                </td>


                <td>

                    ${
                        service.created_at
                        ? new Date(service.created_at)
                            .toLocaleDateString()
                        : "-"
                    }

                </td>


                <td>

                    <button

                        class="edit-btn"

                        onclick="editService(${service.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button

                        class="delete-btn"

                        onclick="deleteService(${service.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}


// ======================================
// SEARCH SERVICES
// ======================================

document
.getElementById("searchService")
.addEventListener("keyup", function(){

    const search = this.value
        .toLowerCase()
        .trim();


    const filtered = services.filter(service => {

        return service.service_name
            .toLowerCase()
            .includes(search);

    });


    displayServices(filtered);

});


// ======================================
// OPEN ADD SERVICE MODAL
// ======================================

document
.getElementById("addServiceBtn")
.addEventListener("click", function(){

    form.reset();

    document.getElementById("serviceId").value = "";

    document.getElementById("modalTitle").innerText =
        "Add Extra Service";

    modal.style.display = "flex";

});


// ======================================
// CLOSE MODAL
// ======================================

document
.getElementById("closeModal")
.addEventListener("click", function(){

    modal.style.display = "none";

});


// ======================================
// CLOSE MODAL OUTSIDE CLICK
// ======================================

window.addEventListener("click", function(event){

    if(event.target === modal){

        modal.style.display = "none";

    }

});


// ======================================
// INITIAL LOAD
// ======================================

loadServices();

// ======================================
// SAVE SERVICE (ADD / UPDATE)
// ======================================

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const id =
        document.getElementById("serviceId").value;

    const service = {

        service_name:
            document.getElementById("serviceName").value.trim(),

        charge:
            document.getElementById("serviceCharge").value,

        charge_type:
            document.getElementById("serviceChargeType").value,

        status:
            document.getElementById("serviceStatus").value

    };

    if(!service.service_name){

        alert("Please enter service name.");

        return;

    }

    try{

        let response;

        // ==============================
        // UPDATE
        // ==============================

        if(id){

            response = await fetch(

                API + "/" + id,

                {

                    method:"PUT",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify(service)

                }

            );

        }

        // ==============================
        // ADD
        // ==============================

        else{

            response = await fetch(

                API,

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify(service)

                }

            );

        }

        const result = await response.json();

        if(!response.ok){

            throw new Error(
                result.message || "Operation failed"
            );

        }

        alert(

            result.message ||
            "Service saved successfully"

        );

        modal.style.display = "none";

        form.reset();

        loadServices();

    }

    catch(error){

        console.error(error);

        alert(

            error.message ||
            "Server Error"

        );

    }

});


// ======================================
// EDIT SERVICE
// ======================================

function editService(id){

    const service =
        services.find(
            item => item.id == id
        );

    if(!service){

        alert("Service not found.");

        return;

    }

    document.getElementById("modalTitle").innerText =
        "Edit Extra Service";

    document.getElementById("serviceId").value =
        service.id;

    document.getElementById("serviceName").value =
        service.service_name;

    document.getElementById("serviceCharge").value =
        service.charge;

    document.getElementById("serviceChargeType").value =
        service.charge_type;

    document.getElementById("serviceStatus").value =
        service.status;

    modal.style.display = "flex";

}


// ======================================
// DELETE SERVICE
// ======================================

async function deleteService(id){

    const service =
        services.find(
            item => item.id == id
        );

    if(!service){

        alert("Service not found.");

        return;

    }

    const confirmDelete = confirm(

        `Are you sure you want to delete "${service.service_name}"?`

    );

    if(!confirmDelete){

        return;

    }

    try{

        const response = await fetch(

            API + "/" + id,

            {

                method:"DELETE"

            }

        );

        const result = await response.json();

        if(!response.ok){

            throw new Error(

                result.message ||
                "Unable to delete service"

            );

        }

        alert(

            result.message ||
            "Service deleted successfully"

        );

        loadServices();

    }

    catch(error){

        console.error(error);

        alert(

            error.message ||
            "Server Error"

        );

    }

}