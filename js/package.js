// ======================================
// Dream Destinations
// package.js
// ======================================

let allPackages = [];


// ======================================
// LOAD PACKAGES
// ======================================

async function loadPackages() {

    showLoading();

    try {

        const response = await fetch("/api/packages");
        

        if (!response.ok) {
            throw new Error("Unable to load packages.");
        }

        const packages = await response.json();

        allPackages = Array.isArray(packages)
            ? packages
            : [];

        loadCategories();

        filterPackages(
            document.getElementById("searchInput")?.value
                .toLowerCase()
                .trim() || "",
            document.getElementById("categoryFilter")?.value || "all"
        );

    }

    catch (error) {

        console.error(
            "Package Loading Error:",
            error
        );

        document.getElementById(
            "packagesContainer"
        ).innerHTML = `

            <div class="no-data">

                <h2>No Packages Found</h2>

                <p>
                    Unable to load packages.
                </p>

            </div>

        `;

    }

}


// ======================================
// DISPLAY PACKAGES
// ======================================

function displayPackages(packages) {

    const container =
        document.getElementById("packagesContainer");

    container.innerHTML = "";

    if (packages.length === 0) {

        showNoPackages();

        return;

    }


    packages.forEach(pkg => {

        const isLiked =
            isPackageLiked(pkg.id);


        container.innerHTML += `

        <div class="package-card">

            <!-- PACKAGE IMAGE -->

            <div class="package-image-wrapper">

                <img
                    src="/images/packages/${pkg.image}"
                    alt="${pkg.package_name}"
                    onerror="this.src='https://placehold.co/400x250?text=No+Image'"
                >


                <!-- LIKE BUTTON -->

                <button
                    type="button"
                    class="like-btn ${isLiked ? "liked" : ""}"
                    onclick="toggleLike(${pkg.id}, this)"
                    title="${isLiked ? "Unlike" : "Like"}">

                    <i class="${
                        isLiked
                        ? "fa-solid"
                        : "fa-regular"
                    } fa-heart"></i>

                </button>

            </div>


            <!-- PACKAGE CONTENT -->

            <div class="package-content">

                 <button
        type="button"
        class="map-icon-btn"
        onclick="openPackageMap(
            '${encodeURIComponent(
                pkg.destination || ""
            )}'
        )"
        title="View Location">

        <i class="fa-solid fa-map-location-dot"></i>

    </button>
                <span class="category-badge">

                    ${pkg.category || "Travel"}

                </span>


                <h3>

                    ${pkg.package_name}

                </h3>


                <p>

                    <i class="fa-solid fa-location-dot"></i>

                    ${pkg.destination}

                </p>


                <h2>

                    ₹${Number(
                        pkg.base_price || 0
                    ).toLocaleString()}

                </h2>


                

                <!-- ACTION BUTTONS -->

                <div class="btn-group">


                    <a
                        href="package-details.html?id=${pkg.id}"
                        class="details-btn">

                        View Details

                    </a>


                    <a
                        href="booking.html?id=${pkg.id}"
                        class="book-btn">

                        Book Now

                    </a>


                </div>


            </div>

        </div>

        `;

    });

}

function restoreWishlistState() {

    const wishlist =
        JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];


    document
        .querySelectorAll(".wishlist-btn")
        .forEach(button => {

            const onclick =
                button.getAttribute(
                    "onclick"
                );


            const match =
                onclick.match(
                    /toggleWishlist\((\d+)/
                );


            if (!match) return;


            const packageId =
                Number(match[1]);


            if (
                wishlist.includes(packageId)
            ) {

                button.classList.add(
                    "active"
                );


                const icon =
                    button.querySelector("i");

                const text =
                    button.querySelector("span");


                icon.className =
                    "fa-solid fa-heart";

                text.innerText =
                    "Wishlisted";

            }

        });

}

// ======================================
// LOAD CATEGORY DROPDOWN
// ======================================

function loadCategories() {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!categoryFilter) return;


    const categories = [
        ...new Set(

            allPackages

                .map(pkg =>
                    String(
                        pkg.category || ""
                    ).trim()
                )

                .filter(category =>
                    category !== ""
                )

        )
    ];


    categoryFilter.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(category => {

        categoryFilter.innerHTML += `

            <option value="${category}">

                ${category}

            </option>

        `;

    });

}


// ======================================
// SEARCH
// ======================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            applyFilters();

        }
    );

}


// ======================================
// CATEGORY FILTER
// ======================================

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function () {

            applyFilters();

        }
    );

}


// ======================================
// APPLY FILTERS
// ======================================

function applyFilters() {

    const search =
        document.getElementById(
            "searchInput"
        )?.value
        .toLowerCase()
        .trim() || "";


    const category =
        document.getElementById(
            "categoryFilter"
        )?.value || "all";


    filterPackages(
        search,
        category
    );

}


// ======================================
// FILTER PACKAGES
// ======================================

function filterPackages(search, category) {

    const searchText =
        String(search || "")
            .toLowerCase()
            .trim();


    const selectedCategory =
        String(category || "all")
            .toLowerCase()
            .trim();


    const filtered =
        allPackages.filter(pkg => {

            const packageName =
                String(pkg.package_name || "")
                    .toLowerCase()
                    .trim();


            const destination =
                String(pkg.destination || "")
                    .toLowerCase()
                    .trim();


            const pkgCategory =
                String(pkg.category || "")
                    .toLowerCase()
                    .trim();


            // SEARCH

            const matchSearch =
                searchText === "" ||
                packageName.includes(searchText) ||
                destination.includes(searchText);


            // CATEGORY

            let matchCategory = true;


            if (selectedCategory !== "all") {

                matchCategory =
                    pkgCategory === selectedCategory;

            }


            return (
                matchSearch &&
                matchCategory
            );

        });


    displayPackages(filtered);

}

// ======================================
// LOADING UI
// ======================================

function showLoading() {

    const container =
        document.getElementById(
            "packagesContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="loading-box">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h3>
                Loading Packages...
            </h3>

        </div>

    `;

}


// ======================================
// NO PACKAGES UI
// ======================================

function showNoPackages() {

    const container =
        document.getElementById(
            "packagesContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="no-data">

            <i class="fa-solid fa-box-open"></i>

            <h2>
                No Packages Found
            </h2>

            <p>
                Please try another search
                or category.
            </p>

        </div>

    `;

}


// ======================================
// REFRESH PACKAGES
// ======================================

function refreshPackages() {

    loadPackages();

}


// ======================================
// PAGE INITIALIZATION
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPackages();

    }
);

// ======================================
// WISHLIST
// ======================================

function toggleWishlist(packageId, button) {

    let wishlist =
        JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];


    const index =
        wishlist.indexOf(Number(packageId));


    const icon =
        button.querySelector("i");


    const text =
        button.querySelector("span");


    // REMOVE FROM WISHLIST

    if (index !== -1) {

        wishlist.splice(index, 1);

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );


        icon.className =
            "fa-regular fa-heart";

        text.innerText =
            "Wishlist";

        button.classList.remove(
            "active"
        );

    }


    // ADD TO WISHLIST

    else {

        wishlist.push(
            Number(packageId)
        );

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );


        icon.className =
            "fa-solid fa-heart";

        text.innerText =
            "Wishlisted";

        button.classList.add(
            "active"
        );

    }

}

// ======================================
// OPEN PACKAGE MAP
// ======================================

function openPackageMap(destination) {

    const decodedDestination =
        decodeURIComponent(
            destination
        );


    if (!decodedDestination) {

        alert(
            "Destination location is not available."
        );

        return;

    }


    const mapUrl =
        "https://www.google.com/maps/search/?api=1&query="
        +
        encodeURIComponent(
            decodedDestination
        );


    window.open(
        mapUrl,
        "_blank"
    );

}

// ======================================
// LIKE / UNLIKE PACKAGE
// ======================================

function toggleLike(packageId, button) {

    let likedPackages =
        JSON.parse(
            localStorage.getItem("likedPackages")
        ) || [];


    packageId =
        Number(packageId);


    const index =
        likedPackages.indexOf(packageId);


    const icon =
        button.querySelector("i");


    // ==============================
    // UNLIKE
    // ==============================

    if (index !== -1) {

        likedPackages.splice(
            index,
            1
        );


        localStorage.setItem(
            "likedPackages",
            JSON.stringify(
                likedPackages
            )
        );


        button.classList.remove(
            "liked"
        );


        icon.className =
            "fa-regular fa-heart";


        button.title =
            "Like";

    }


    // ==============================
    // LIKE
    // ==============================

    else {

        likedPackages.push(
            packageId
        );


        localStorage.setItem(
            "likedPackages",
            JSON.stringify(
                likedPackages
            )
        );


        button.classList.add(
            "liked"
        );


        icon.className =
            "fa-solid fa-heart";


        button.title =
            "Unlike";

    }

}

function isPackageLiked(packageId) {

    const likedPackages =
        JSON.parse(
            localStorage.getItem(
                "likedPackages"
            )
        ) || [];


    return likedPackages.includes(
        Number(packageId)
    );

}

// ==========================================
// DYNAMIC USER PROFILE IN NAVBAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const nameElement =
        document.getElementById("navUserName");

    const photoElement =
        document.getElementById("navProfilePhoto");


    // Get logged-in user details
    const userName =
        localStorage.getItem("userName");

    const userPhoto =
        localStorage.getItem("userPhoto");


    // Username
    if (userName && userName.trim() !== "") {

        nameElement.textContent =
            userName;

    } else {

        nameElement.textContent =
            "User";

    }


    // Profile photo
    if (userPhoto && userPhoto.trim() !== "") {

        photoElement.src =
            userPhoto;

    }

});

console.log(
    "✅ Dream Destinations Package Module Loaded Successfully"
);