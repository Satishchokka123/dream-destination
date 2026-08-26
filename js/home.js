// ==========================================
// DREAM DESTINATIONS
// home.js
// ==========================================

let homePackages = [];


// ==========================================
// LOAD PACKAGES
// ==========================================

async function loadHomePackages() {

    try {

        const response =
            await fetch("http://localhost:3000/api/packages");


        if (!response.ok) {

            throw new Error(
                "Unable to load packages"
            );

        }


        const packages =
            await response.json();


        homePackages = packages;


        displayPopularPackages(
            homePackages.slice(0, 3)
        );


    }

    catch (error) {

        console.error(
            "Home Packages Error:",
            error
        );


        showHomePackageError();

    }

}


// ==========================================
// DISPLAY POPULAR PACKAGES
// ==========================================

function displayPopularPackages(packages) {

    const container =
        document.getElementById(
            "popularPackages"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (!packages.length) {

        container.innerHTML = `

            <div class="home-no-data">

                <i class="fa-solid fa-box-open"></i>

                <h3>
                    No Packages Available
                </h3>

                <p>
                    New travel packages will
                    appear here soon.
                </p>

            </div>

        `;

        return;

    }


    packages.forEach(pkg => {


        const image =
            pkg.image
            ? `http://localhost:3000/images/packages/${pkg.image}`
            : "https://placehold.co/500x350/e0f5ff/0369a1?text=Travel";


        const price =
            Number(
                pkg.base_price || 0
            ).toLocaleString();


        container.innerHTML += `

            <article class="home-package-card">


                <div class="home-package-image">

                    <img
                        src="${image}"
                        alt="${pkg.package_name || "Travel Package"}"

                        onerror="
                            this.src='https://placehold.co/500x350/e0f5ff/0369a1?text=Travel'
                        "
                    >


                    <span class="home-package-category">

                        ${pkg.category || "Travel"}

                    </span>

                </div>



                <div class="home-package-content">


                    <h3>

                        ${pkg.package_name || "Travel Package"}

                    </h3>


                    <p>

                        <i class="fa-solid fa-location-dot"></i>

                        ${pkg.destination || "Amazing Destination"}

                    </p>


                    <div class="home-package-bottom">


                        <div>

                            <small>
                                Starting from
                            </small>

                            <strong>
                                ₹${price}
                            </strong>

                        </div>


                        <a
                            href="package-details.html?id=${pkg.id}"
                            class="home-package-btn">

                            View

                            <i class="fa-solid fa-arrow-right"></i>

                        </a>


                    </div>


                </div>

            </article>

        `;

    });

}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showHomePackageError() {

    const container =
        document.getElementById(
            "popularPackages"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="home-no-data">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Unable to Load Packages
            </h3>

            <p>
                Please try again later.
            </p>

        </div>

    `;

}


// ==========================================
// USER NAME
// ==========================================

function loadUserName() {

    const userName =
        document.getElementById(
            "userName"
        );


    if (!userName) {

        return;

    }


    /*
       If your login system stores
       the user's name in localStorage,
       it will be displayed here.
    */

    const storedName =
        localStorage.getItem(
            "userName"
        );


    if (storedName) {

        userName.innerText =
            storedName;

    }

}


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHomePackages();

        loadUserName();

    }
);


// ==========================================
// REFRESH
// ==========================================

function refreshHomePackages() {

    loadHomePackages();

}


console.log(
    "✅ Dream Destinations Home Module Loaded Successfully"
);