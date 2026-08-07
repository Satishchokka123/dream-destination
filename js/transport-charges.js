// ======================================
// SAVE TRANSPORT
// ======================================

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const id = document.getElementById("transportId").value;

    const transport = {

        transport_name:
        document.getElementById("transportName").value,

        charge:
        document.getElementById("transportCharge").value,

        status:
        document.getElementById("transportStatus").value

    };

    try{

        let response;

        if(id){

            response = await fetch(API + "/" + id,{

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(transport)

            });

        }
        else{

            response = await fetch(API,{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(transport)

            });

        }

        const result = await response.json();

        alert(result.message);

        modal.style.display = "none";

        loadTransport();

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

});

// ======================================
// EDIT TRANSPORT
// ======================================

function editTransport(id){

    const transport = transports.find(t=>t.id==id);

    if(!transport) return;

    document.getElementById("modalTitle").innerText =
    "Edit Transport";

    document.getElementById("transportId").value =
    transport.id;

    document.getElementById("transportName").value =
    transport.transport_name;

    document.getElementById("transportCharge").value =
    transport.charge;

    document.getElementById("transportStatus").value =
    transport.status;

    modal.style.display = "flex";

}

// ======================================
// DELETE TRANSPORT
// ======================================

async function deleteTransport(id){

    if(!confirm("Delete this transport?")){

        return;

    }

    try{

        const response = await fetch(API + "/" + id,{

            method:"DELETE"

        });

        const result = await response.json();

        alert(result.message);

        loadTransport();

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

}