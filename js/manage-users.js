// ======================================
// Dream Destinations
// Manage Users
// ======================================

const tableBody = document.getElementById("usersTable");

const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("userModal");

const closeModal = document.getElementById("closeModal");


// Statistics

const totalUsers = document.getElementById("totalUsers");

const activeUsers = document.getElementById("activeUsers");

const blockedUsers = document.getElementById("blockedUsers");

const todayUsers = document.getElementById("todayUsers");


// ======================================
// LOAD USERS
// ======================================

function loadUsers() {

    fetch("http://localhost:3000/api/users")

    .then(res => res.json())

    .then(users => {

        tableBody.innerHTML = "";

        let total = users.length;

        let active = 0;

        let blocked = 0;

        let today = 0;

        users.forEach(user => {

            if (user.status === "Blocked") {

                blocked++;

            } else {

                active++;

            }
    
            const todayDate = new Date().toDateString();
            let today = 0;

             
            if(user.created_at){

    const created = new Date(user.created_at).toDateString();

    if(created === todayDate){

        today++;

    }

}
            const row = document.createElement("tr");

            row.innerHTML = `
            
                <td>${user.id}</td>

                <td>${user.name ?? ""}</td>

                <td>${user.email}</td>

                <td>${user.phone ?? ""}</td>

                <td>

                    <span class="status ${user.status === "Blocked" ? "blocked" : "active"}">

                        ${user.status || "Active"}

                    </span>

                </td>

                <td>

                    ${user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "-"}

                </td>

                <td>

                    <button class="view-btn"

                    onclick="viewUser(${user.id})">

                    View

                    </button>

                    <button class="block-btn"

                    onclick="toggleStatus(${user.id},'${user.status || "Active"}')">

                    ${user.status === "Blocked" ? "Unblock" : "Block"}

                    </button>

                    <button class="delete-btn"

                    onclick="deleteUser(${user.id})">

                    Delete

                    </button>

                </td>

            `;

            tableBody.appendChild(row);

        });

        totalUsers.innerText = total;

        activeUsers.innerText = active;

        blockedUsers.innerText = blocked;

        todayUsers.innerText = today;

    })

    .catch(err => {

        console.log(err);

        alert("Unable to load users.");

    });

}

loadUsers();

// ======================================
// SEARCH USERS
// ======================================

searchInput.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display = text.includes(value) ? "" : "none";

    });

});

// ======================================
// VIEW USER
// ======================================

function viewUser(id){

    fetch(`http://localhost:3000/api/users/${id}`)

    .then(res => res.json())

    .then(user => {

        document.getElementById("viewName").innerText =
            user.name || "-";

        document.getElementById("viewEmail").innerText =
            user.email || "-";

        document.getElementById("viewMobile").innerText =
            user.phone || "-";

        document.getElementById("viewAddress").innerText =
            user.address || "-";

        document.getElementById("viewDate").innerText =
            user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "-";

        document.getElementById("viewStatus").innerText =
            user.status || "Active";

        document.getElementById("viewBookings").innerText = "0";

        modal.style.display = "flex";

    })

    .catch(err => {

        console.log(err);

        alert("Unable to load user.");

    });

}

// ======================================
// CLOSE MODAL
// ======================================

closeModal.onclick = function(){

    modal.style.display = "none";

};

window.onclick = function(e){

    if(e.target==modal){

        modal.style.display="none";

    }

};

// ======================================
// BLOCK / UNBLOCK USER
// ======================================

function toggleStatus(id, currentStatus){

    const newStatus =
        currentStatus === "Blocked"
        ? "Active"
        : "Blocked";

    if(!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this user?`)){

        return;

    }

    fetch(`http://localhost:3000/api/users/${id}/status`,{

        method:"PUT",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            status:newStatus

        })

    })

    .then(res=>res.json())

    .then(data=>{

        alert(data.message);

        loadUsers();

    })

    .catch(err=>{

        console.log(err);

        alert("Unable to update user status.");

    });

}



// ======================================
// DELETE USER
// ======================================

function deleteUser(id){

    if(!confirm("Are you sure you want to delete this user?")){

        return;

    }

    fetch(`http://localhost:3000/api/users/${id}`,{

        method:"DELETE"

    })

    .then(res=>res.json())

    .then(data=>{

        alert(data.message);

        loadUsers();

    })

    .catch(err=>{

        console.log(err);

        alert("Unable to delete user.");

    });

}



// ======================================
// AUTO REFRESH
// ======================================

setInterval(()=>{

    loadUsers();

},30000);