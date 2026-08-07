// ======================================
// Dream Destinations
// package.js
// ======================================

let allPackages = [];

// ======================================
// LOAD PACKAGES
// ======================================

async function loadPackages() {

    try {

        const response = await fetch("http://localhost:3000/api/packages");

        if (!response.ok) {

            throw new Error("Unable to load packages.");

        }

        const packages = await response.json();

        allPackages = packages;

        displayPackages(allPackages);

        loadCategories();

    }

    catch (error) {

        console.error(error);

        document.getElementById("packagesContainer").innerHTML = `

            <div class="no-data">

                <h2>No Packages Found</h2>

            </div>

        `;

    }

}

// ======================================
// DISPLAY PACKAGES
// ======================================

function displayPackages(packages) {

    const container = document.getElementById("packagesContainer");

    container.innerHTML = "";

    if (packages.length === 0) {

        container.innerHTML = `

            <div class="no-data">

                <h2>No Packages Available</h2>

            </div>

        `;

        return;

    }

    packages.forEach(pkg => {

        container.innerHTML += `

        <div class="package-card">

            <img
    src="http://localhost:3000/images/packages/${pkg.image}"
    alt="${pkg.package_name}"
    onerror="this.src='https://placehold.co/400x250?text=No+Image'"
>

            <div class="package-content">

                <span class="category-badge">

                    ${pkg.category}

                </span>

                <h3>${pkg.package_name}</h3>

                <p>

                    <i class="fa-solid fa-location-dot"></i>

                    ${pkg.destination}

                </p>

                <h2>₹${Number(pkg.base_price).toLocaleString()}</h2>

                <div class="btn-group">

                    <a href="package-details.html?id=${pkg.id}"

                    class="details-btn">

                        View Details

                    </a>

                    <a href="booking.html?id=${pkg.id}"

                    class="book-btn">

                        Book Now

                    </a>

                </div>

            </div>

        </div>

        `;

    });

}

// ======================================
// LOAD CATEGORY DROPDOWN
// ======================================

function loadCategories() {

    const categoryFilter = document.getElementById("categoryFilter");

    if (!categoryFilter) return;

    categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
    `;

    const categories = [...new Set(allPackages.map(pkg => pkg.category))];

    categories.forEach(category => {

        categoryFilter.innerHTML += `

            <option value="${category}">

                ${category}

            </option>

        `;

    });

}

// ======================================
// SEARCH PACKAGE
// ======================================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const search = this.value.toLowerCase().trim();

        const category =
            document.getElementById("categoryFilter").value;

        filterPackages(search, category);

    });

}

// ======================================
// CATEGORY FILTER
// ======================================

const categoryFilter = document.getElementById("categoryFilter");

if (categoryFilter) {

    categoryFilter.addEventListener("change", function () {

        const category = this.value;

        const search =
            document.getElementById("searchInput").value
            .toLowerCase()
            .trim();

        filterPackages(search, category);

    });

}

// ======================================
// FILTER PACKAGES
// ======================================

function filterPackages(search, category) {

    const filtered = allPackages.filter(pkg => {

        const matchSearch =

            pkg.package_name.toLowerCase().includes(search)

            ||

            pkg.destination.toLowerCase().includes(search);

        const matchCategory =

            category === "all"

            ||

            pkg.category === category;

        return matchSearch && matchCategory;

    });

    displayPackages(filtered);

}

// ======================================
// LOADING UI
// ======================================

function showLoading() {

    const container = document.getElementById("packagesContainer");

    if (!container) return;

    container.innerHTML = `

        <div class="loading-box">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h3>Loading Packages...</h3>

        </div>

    `;

}

// ======================================
// NO PACKAGES UI
// ======================================

function showNoPackages() {

    const container = document.getElementById("packagesContainer");

    if (!container) return;

    container.innerHTML = `

        <div class="no-data">

            <i class="fa-solid fa-box-open"></i>

            <h2>No Packages Found</h2>

            <p>Please try another search or category.</p>

        </div>

    `;

}

// ======================================
// DISPLAY OVERRIDE
// ======================================

const originalDisplayPackages = displayPackages;

displayPackages = function(packages){

    if(packages.length === 0){

        showNoPackages();

        return;

    }

    originalDisplayPackages(packages);

};

// ======================================
// PAGE INITIALIZATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    showLoading();

    loadPackages();

});

// ======================================
// REFRESH PACKAGES
// ======================================

function refreshPackages(){

    showLoading();

    loadPackages();

}

console.log("✅ Dream Destinations Package Module Loaded Successfully");