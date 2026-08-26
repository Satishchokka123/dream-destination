// ==========================================
// DREAM DESTINATIONS
// account.js
// ==========================================

const API_URL = "http://localhost:3000";


// ==========================================
// GET USER ID
// ==========================================

function getUserId() {

    return (
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId")
    );

}


// ==========================================
// GET USER NAME
// ==========================================

function getStoredUserName() {

    return (
        localStorage.getItem("userName") ||
        sessionStorage.getItem("userName") ||
        "User"
    );

}


// ==========================================
// LOAD USER PROFILE
// ==========================================

async function loadUserProfile() {

    const userId = getUserId();

    if (!userId) {

        window.location.href = "login.html";

        return;

    }


    try {

        const response = await fetch(
            `${API_URL}/api/users/${userId}`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load user profile"
            );

        }


        const user = await response.json();


        // -------------------------------
        // USER NAME
        // -------------------------------

        const name =
            user.full_name ||
            user.fullName ||
            getStoredUserName();


        const email =
            user.email || "No email";


        const mobile =
            user.mobile || "No mobile number";


        const nameElement =
            document.getElementById(
                "accountUserName"
            );


        const emailElement =
            document.getElementById(
                "accountUserEmail"
            );


        const mobileElement =
            document.getElementById(
                "accountUserMobile"
            );


        if (nameElement) {

            nameElement.innerText = name;

        }


        if (emailElement) {

            emailElement.innerText = email;

        }


        if (mobileElement) {

            mobileElement.innerHTML = `
                <i class="fa-solid fa-phone"></i>
                ${mobile}
            `;

        }


        // -------------------------------
        // EDIT PROFILE VALUES
        // -------------------------------

        const editName =
            document.getElementById(
                "editFullName"
            );


        const editMobile =
            document.getElementById(
                "editMobile"
            );


        if (editName) {

            editName.value = name;

        }


        if (editMobile) {

            editMobile.value = mobile;

        }


        // -------------------------------
        // PHOTO
        // -------------------------------

        if (user.profile_photo) {

            const photo =
                document.getElementById(
                    "profilePhoto"
                );


            if (photo) {

                photo.src =
                    `${API_URL}/images/users/${user.profile_photo}`;

            }

        }


    }

    catch (error) {

        console.error(
            "Profile Error:",
            error
        );

        // Use locally stored name if API fails

        const name =
            getStoredUserName();


        const nameElement =
            document.getElementById(
                "accountUserName"
            );


        if (nameElement) {

            nameElement.innerText =
                name;

        }

    }

}


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    const userId = getUserId();


    if (!userId) {

        return;

    }


    try {

        /*
         * IMPORTANT:
         * This API must return bookings
         * belonging to the logged-in user.
         */

        const response = await fetch(
            `${API_URL}/api/users/${userId}/bookings`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load bookings"
            );

        }


        const bookings =
            await response.json();


        if (!Array.isArray(bookings)) {

            throw new Error(
                "Invalid booking response"
            );

        }


        updateBookingStatistics(
            bookings
        );


        displayBookingHistory(
            bookings
        );


        displayUpcomingTrip(
            bookings
        );

    }

    catch (error) {

        console.error(
            "Booking Error:",
            error
        );


        updateBookingStatistics([]);


        displayBookingHistory([]);


        displayUpcomingTrip([]);

    }

}


// ==========================================
// UPDATE BOOKING STATISTICS
// ==========================================

function updateBookingStatistics(
    bookings
) {


    const total =
        bookings.length;


    const pending =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "pending"
        ).length;


    const completed =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "completed"
        ).length;


    const cancelled =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "cancelled"
        ).length;


    setText(
        "totalBookings",
        total
    );


    setText(
        "pendingBookings",
        pending
    );


    setText(
        "completedBookings",
        completed
    );


    console.log(
        "Cancelled bookings:",
        cancelled
    );

}


// ==========================================
// NORMALIZE STATUS
// ==========================================

function normalizeStatus(status) {

    return String(
        status || ""
    )
    .toLowerCase()
    .trim();

}


// ==========================================
// DISPLAY BOOKING HISTORY
// ==========================================

function displayBookingHistory(
    bookings
) {

    const container =
        document.getElementById(
            "bookingHistory"
        );


    if (!container) {

        return;

    }


    if (bookings.length === 0) {

        container.innerHTML = `

            <div class="wishlist-empty">

                <i class="fa-regular fa-calendar"></i>

                <h3>
                    No Booking History
                </h3>

                <p>
                    Your bookings will appear here.
                </p>

            </div>

        `;

        return;

    }


    // Latest bookings first

    const recentBookings =
        [...bookings]
        .sort(
            (a, b) =>
                Number(b.id || 0) -
                Number(a.id || 0)
        )
        .slice(0, 5);


    container.innerHTML = "";


    recentBookings.forEach(
        booking => {

            const packageName =
                booking.package_name ||
                booking.packageName ||
                "Travel Package";


            const travelDate =
                formatDate(
                    booking.travel_date
                );


            const price =
                Number(
                    booking.total_price || 0
                ).toLocaleString(
                    "en-IN"
                );


            const status =
                booking.status ||
                "Pending";


            const statusClass =
                getStatusClass(status);


            container.innerHTML += `

                <div class="booking-item">

                    <div class="booking-item-left">

                        <div class="booking-package-icon">

                            <i class="fa-solid fa-suitcase-rolling"></i>

                        </div>


                        <div>

                            <h4>
                                ${escapeHTML(
                                    packageName
                                )}
                            </h4>


                            <p>
                                <i class="fa-regular fa-calendar"></i>

                                ${travelDate}
                            </p>


                            <span
                                class="booking-status ${statusClass}">

                                ${escapeHTML(
                                    status
                                )}

                            </span>

                        </div>

                    </div>


                    <div class="booking-price">

                        ₹${price}

                    </div>

                </div>

            `;

        }
    );

}


// ==========================================
// UPCOMING TRIP
// ==========================================

function displayUpcomingTrip(
    bookings
) {

    const container =
        document.getElementById(
            "upcomingTrip"
        );


    if (!container) {

        return;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const upcoming =
        bookings
        .filter(booking => {

            const status =
                normalizeStatus(
                    booking.status
                );


            if (
                status === "cancelled"
            ) {

                return false;

            }


            if (
                status === "completed"
            ) {

                return false;

            }


            if (
                !booking.travel_date
            ) {

                return false;

            }


            const travelDate =
                new Date(
                    booking.travel_date
                );


            return travelDate >= today;

        })
        .sort(
            (a, b) =>
                new Date(a.travel_date) -
                new Date(b.travel_date)
        );


    if (upcoming.length === 0) {

        container.innerHTML = `

            <div class="wishlist-empty">

                <i class="fa-solid fa-plane"></i>

                <h3>
                    No Upcoming Trips
                </h3>

                <p>
                    Start planning your next adventure.
                </p>


                <a href="package.html">

                    Explore Packages

                </a>

            </div>

        `;

        return;

    }


    const trip =
        upcoming[0];


    const packageName =
        trip.package_name ||
        "Upcoming Trip";


    const destination =
        trip.destination ||
        "Your Destination";


    const date =
        formatDate(
            trip.travel_date
        );


    const price =
        Number(
            trip.total_price || 0
        ).toLocaleString(
            "en-IN"
        );


    container.innerHTML = `

        <div class="booking-item">

            <div class="booking-item-left">

                <div class="booking-package-icon">

                    <i class="fa-solid fa-plane"></i>

                </div>


                <div>

                    <h4>
                        ${escapeHTML(
                            packageName
                        )}
                    </h4>


                    <p>

                        <i class="fa-solid fa-location-dot"></i>

                        ${escapeHTML(
                            destination
                        )}

                    </p>


                    <p>

                        <i class="fa-regular fa-calendar"></i>

                        ${date}

                    </p>

                </div>

            </div>


            <div class="booking-price">

                ₹${price}

            </div>

        </div>

    `;

}


// ==========================================
// WISHLIST
// ==========================================

function loadWishlist() {

    const wishlist =
        JSON.parse(
            localStorage.getItem(
                "wishlist"
            ) || "[]"
        );


    setText(
        "wishlistCount",
        wishlist.length
    );


    const container =
        document.getElementById(
            "wishlistContainer"
        );


    if (!container) {

        return;

    }


    if (wishlist.length === 0) {

        return;

    }


    container.innerHTML = "";


    wishlist.slice(0, 4)
        .forEach(pkg => {

            container.innerHTML += `

                <div class="booking-item">

                    <div class="booking-item-left">

                        <div class="booking-package-icon">

                            <i class="fa-solid fa-heart"></i>

                        </div>


                        <div>

                            <h4>
                                ${escapeHTML(
                                    pkg.package_name ||
                                    pkg.packageName ||
                                    "Saved Package"
                                )}
                            </h4>


                            <p>

                                ${escapeHTML(
                                    pkg.destination ||
                                    "Destination"
                                )}

                            </p>

                        </div>

                    </div>


                    <div class="booking-price">

                        ₹${Number(
                            pkg.base_price || 0
                        ).toLocaleString(
                            "en-IN"
                        )}

                    </div>

                </div>

            `;

        });

}


// ==========================================
// EDIT PROFILE
// ==========================================

function openEditProfile() {

    const modal =
        document.getElementById(
            "editProfileModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function closeEditProfile() {

    const modal =
        document.getElementById(
            "editProfileModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ==========================================
// SAVE PROFILE
// ==========================================

const editProfileForm =
    document.getElementById(
        "editProfileForm"
    );


if (editProfileForm) {

    editProfileForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const userId =
                getUserId();


            if (!userId) {

                return;

            }


            const fullName =
                document.getElementById(
                    "editFullName"
                ).value.trim();


            const mobile =
                document.getElementById(
                    "editMobile"
                ).value.trim();


            if (
                !fullName ||
                !mobile
            ) {

                alert(
                    "Please fill all fields."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/users/${userId}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                full_name:
                                    fullName,

                                mobile:
                                    mobile

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Update failed"
                    );

                }


                // Update local name

                localStorage.setItem(
                    "userName",
                    fullName
                );


                setText(
                    "accountUserName",
                    fullName
                );


                setText(
                    "accountUserMobile",
                    mobile
                );


                closeEditProfile();


                alert(
                    "Profile updated successfully."
                );

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    error.message ||
                    "Unable to update profile."
                );

            }

        }
    );

}


// ==========================================
// CHANGE PASSWORD
// ==========================================

function openPasswordModal() {

    alert(
        "Change password feature will be connected in the next step."
    );

}


// ==========================================
// PROFILE PHOTO PREVIEW
// ==========================================

const photoInput =
    document.getElementById(
        "photoInput"
    );


if (photoInput) {

    photoInput.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const photo =
                        document.getElementById(
                            "profilePhoto"
                        );


                    if (photo) {

                        photo.src =
                            event.target.result;

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "userName"
    );

    localStorage.removeItem(
        "userEmail"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );


    sessionStorage.removeItem(
        "userId"
    );

    sessionStorage.removeItem(
        "userName"
    );

    sessionStorage.removeItem(
        "userEmail"
    );

    sessionStorage.removeItem(
        "isLoggedIn"
    );


    window.location.href =
        "login.html";

}


// ==========================================
// HELPERS
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            value;

    }

}


function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "Date not available";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getStatusClass(
    status
) {

    const value =
        normalizeStatus(
            status
        );


    if (
        value === "confirmed"
    ) {

        return "status-confirmed";

    }


    if (
        value === "completed"
    ) {

        return "status-completed";

    }


    if (
        value === "cancelled"
    ) {

        return "status-cancelled";

    }


    return "status-pending";

}


function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// INITIALIZE ACCOUNT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await loadUserProfile();

        await loadBookings();

        loadWishlist();

    }
);