// =======================================
// Dream Destinations
// Manage Packages
// =======================================

let allPackages = [];

let editId = null;
// ===============================
// Load Packages
// ===============================

function loadPackages(){

    fetch("http://localhost:3000/api/packages")

    .then(response => response.json())

    .then(data => {

        allPackages = data;

        displayPackages(allPackages);

    })

    .catch(error => {

        console.log(error);

    });

}


// ===============================
// Display Packages
// ===============================

function displayPackages(packages){

    const table = document.getElementById("packageTable");

    table.innerHTML = "";

    packages.forEach(pkg => {

        table.innerHTML += `

        <tr>

            <td>${pkg.id}</td>

            <td>

                <img src="../images/packages/${pkg.image}" alt="Package">

            </td>

            <td>${pkg.package_name}</td>

            <td>${pkg.destination}</td>

            <td>₹${Number(pkg.base_price).toLocaleString()}</td>

            <td>

                <button class="edit-btn" onclick="editPackage(${pkg.id})">
    Edit
</button>

                <button
                    class="delete-btn"
                    onclick="deletePackage(${pkg.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}


// ===============================
// Search
// ===============================

document.getElementById("searchInput")

.addEventListener("keyup", function(){

    const keyword = this.value.toLowerCase();

    const filtered = allPackages.filter(pkg =>

        pkg.package_name.toLowerCase().includes(keyword)

        ||

        pkg.destination.toLowerCase().includes(keyword)

    );

    displayPackages(filtered);

});


// ===============================
// Edit
// ===============================

function editPackage(id){

    fetch("http://localhost:3000/api/packages/" + id)

    .then(res => res.json())

    .then(pkg => {

        editId = id;

        document.getElementById("modalTitle").innerText = "Edit Package";

        document.getElementById("packageName").value = pkg.package_name;
        document.getElementById("destination").value = pkg.destination;
        document.getElementById("category").value = pkg.category;
        document.getElementById("basePrice").value = pkg.base_price;
        document.getElementById("duration").value =pkg.duration;
        document.getElementById("description").value =pkg.description;


        document.getElementById("packageImage").value = "";

        document.getElementById("previewImage").src =
"../images/packages/" + pkg.image;

        modal.style.display = "flex";

    });

}
// ===============================
// Delete
// ===============================

function deletePackage(id){

    const confirmDelete = confirm("Are you sure you want to delete this package?");

    if(!confirmDelete){

        return;

    }

    fetch("http://localhost:3000/api/packages/" + id, {

        method: "DELETE"

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadPackages();

    })

    .catch(err => {

        console.log(err);

        alert("Failed to delete package.");

    });

}

// ===============================
// Start
// ===============================

loadPackages();

// ===============================
// Modal
// ===============================

const modal = document.getElementById("packageModal");

document.getElementById("addPackageBtn")

.addEventListener("click", () => {

    modal.style.display = "flex";

});

document.getElementById("closeModal")

.addEventListener("click", () => {

    modal.style.display = "none";

});

window.onclick = function(e){

    if(e.target === modal){

        modal.style.display = "none";

    }

};

// ===============================
// Save Package
// ===============================

// ======================================
// Save Package
// ======================================

// ======================================
// Save / Update Package
// ======================================

document.getElementById("savePackage").addEventListener("click", () => {

    const packageName = document.getElementById("packageName").value.trim();
    const destination = document.getElementById("destination").value.trim();
    const basePrice = document.getElementById("basePrice").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const description = document.getElementById("description").value.trim();
    const image = document.getElementById("packageImage").files[0];
    const category = document.getElementById("category").value;

    if (!packageName || !destination || !category  || !basePrice ||
!duration ||
!description) {

        alert("Please fill all required fields.");

        return;

    }

    const formData = new FormData();

    formData.append("package_name", packageName);
    formData.append("destination", destination);
    formData.append("category", category);
    formData.append("base_price", basePrice);
    formData.append("duration", duration);
    formData.append("description", description);

    if (image) {

        formData.append("image", image);

    }

    let url = "http://localhost:3000/api/packages";
    let method = "POST";

    if (editId != null) {

        url = "http://localhost:3000/api/packages/" + editId;
        method = "PUT";

    } else {

        if (!image) {

            alert("Please select an image.");

            return;

        }

    }

    fetch(url, {

        method: method,
        body: formData

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        modal.style.display = "none";

        editId = null;

        document.getElementById("modalTitle").innerText = "Add New Package";

        document.getElementById("packageName").value = "";
        document.getElementById("destination").value = "";
        document.getElementById("basePrice").value = "";
        document.getElementById("packageImage").value = "";
       document.getElementById("duration").value="";
        document.getElementById("description").value="";

        document.getElementById("previewImage").src =
    "../images/no-image.png";

        loadPackages();

    })

    .catch(err => {

        console.log(err);

        alert("Something went wrong.");

    });

});

// ======================================
// Image Preview
// ======================================

document.getElementById("packageImage")

.addEventListener("change", function(){

    const file = this.files[0];

    if(file){

        const reader = new FileReader();

        reader.onload = function(e){

            document.getElementById("previewImage").src = e.target.result;

        }

        reader.readAsDataURL(file);

    }

});