// ======================================
// Dream Destinations
// package-details.js
// ======================================

// Get Package ID from URL

const params = new URLSearchParams(window.location.search);

const packageId = params.get("id");

// ===============================
// Load Package Details
// ===============================

async function loadPackageDetails() {

    if (!packageId) {

        alert("Invalid Package");

        window.location.href = "package.html";

        return;

    }

    try {

        const response = await fetch(

            `http://localhost:3000/api/packages/${packageId}`

        );

        if (!response.ok) {

            throw new Error("Package Not Found");

        }

        const pkg = await response.json();

        // Image

        document.getElementById("packageImage").src =

        `http://localhost:3000/images/packages/${pkg.image}`;

        document.getElementById("packageImage").alt =

        pkg.package_name;

        // Details

        document.getElementById("packageCategory").innerText =

        pkg.category;

        document.getElementById("packageName").innerText =

        pkg.package_name;

        document.getElementById("packageDestination").innerText =

        pkg.destination;

        document.getElementById("packageDuration").innerText =

        pkg.duration;

        document.getElementById("packagePrice").innerText =

        Number(pkg.base_price).toLocaleString();

        document.getElementById("packageDescription").innerText =

        pkg.description;

        // Book Now Button

        document.getElementById("bookNowBtn").href =

        `booking.html?id=${pkg.id}`;

        // Page Title

        document.title =

        pkg.package_name + " | Dream Destinations";

    }

    catch (error) {

        console.error(error);

        alert("Unable to load package.");

        window.location.href = "package.html";

    }

}

// ===============================
// Initialize
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadPackageDetails();

});