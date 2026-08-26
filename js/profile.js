// ==========================================
// DREAM DESTINATIONS
// profile.js
// ==========================================


// ==========================================
// GET LOGGED-IN USER
// ==========================================

const userId =
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId");

const userName =
    localStorage.getItem("userName") ||
    sessionStorage.getItem("userName") ||
    "User";

const userEmail =
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail") ||
    "";

const userPhoto =
    localStorage.getItem("userPhoto") ||
    sessionStorage.getItem("userPhoto") ||
    "../images/default-profile.png";


// ==========================================
// DOM ELEMENTS
// ==========================================

const navProfilePhoto =
    document.getElementById("navProfilePhoto");

const navUserName =
    document.getElementById("navUserName");

const headerUserName =
    document.getElementById("headerUserName");

const profilePhoto =
    document.getElementById("profilePhoto");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const nameInput =
    document.getElementById("nameInput");

const emailInput =
    document.getElementById("emailInput");

const phoneInput =
    document.getElementById("phoneInput");

const addressInput =
    document.getElementById("addressInput");

const photoInput =
    document.getElementById("photoInput");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const profileMessage =
    document.getElementById("profileMessage");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!userId) {

    alert("Please login to access your account.");

    window.location.href =
        "login.html";

}


// ==========================================
// LOAD BASIC USER DETAILS
// ==========================================

function loadUserDetails() {

    if (navUserName) {

        navUserName.textContent =
            userName;

    }


    if (headerUserName) {

        headerUserName.textContent =
            userName;

    }


    if (profileName) {

        profileName.textContent =
            userName;

    }


    if (profileEmail) {

        profileEmail.textContent =
            userEmail;

    }


    if (nameInput) {

        nameInput.value =
            userName;

    }


    if (emailInput) {

        emailInput.value =
            userEmail;

    }


    // Profile photo

    if (profilePhoto) {

        profilePhoto.src =
            userPhoto;

    }


    if (navProfilePhoto) {

        navProfilePhoto.src =
            userPhoto;

    }

}


// ==========================================
// LOAD USER DETAILS
// ==========================================

// ==========================================
// LOAD PROFILE FROM DATABASE
// ==========================================

async function loadUserFromDatabase() {

    if (!userId) {
        return;
    }

    try {

        const response =
            await fetch(
                `http://localhost:3000/api/profile/${userId}`
            );

        const data =
            await response.json();

        console.log(
            "Profile Data:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load profile"
            );

        }

        const user =
            data.user;


        // ==================================
        // BASIC DETAILS
        // ==================================

        if (navUserName) {

            navUserName.textContent =
                user.name || "User";

        }

        if (headerUserName) {

            headerUserName.textContent =
                user.name || "User";

        }

        if (profileName) {

            profileName.textContent =
                user.name || "User";

        }

        if (profileEmail) {

            profileEmail.textContent =
                user.email || "";

        }


        // ==================================
        // FORM
        // ==================================

        if (nameInput) {

            nameInput.value =
                user.name || "";

        }

        if (emailInput) {

            emailInput.value =
                user.email || "";

        }

        if (phoneInput) {

            phoneInput.value =
                user.phone || "";

        }

        if (addressInput) {

            addressInput.value =
                user.address || "";

        }


        // ==================================
        // PROFILE PHOTO
        // ==================================

        if (user.profilePhoto) {

            const photoURL =
                `http://localhost:3000${user.profilePhoto}`;

            if (profilePhoto) {

                profilePhoto.src =
                    photoURL;

            }

            if (navProfilePhoto) {

                navProfilePhoto.src =
                    photoURL;

            }


            // Save latest photo

            const storage =
                localStorage.getItem("userId")
                    ? localStorage
                    : sessionStorage;

            storage.setItem(
                "userPhoto",
                photoURL
            );

        }


        // ==================================
        // UPDATE STORAGE
        // ==================================

        const storage =
            localStorage.getItem("userId")
                ? localStorage
                : sessionStorage;

        storage.setItem(
            "userName",
            user.name || ""
        );

        storage.setItem(
            "userEmail",
            user.email || ""
        );


    }
    catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );

    }

}


// ==========================================
// LOAD FROM DATABASE
// ==========================================

loadUserFromDatabase();


// ==========================================
// PROFILE PHOTO PREVIEW
// ==========================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            // Check image

            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image."
                );

                this.value = "";

                return;

            }


            // Maximum 5 MB

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image size must be less than 5 MB."
                );

                this.value = "";

                return;

            }


            // Preview

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const imageURL =
                        event.target.result;


                    if (profilePhoto) {

                        profilePhoto.src =
                            imageURL;

                    }


                    if (navProfilePhoto) {

                        navProfilePhoto.src =
                            imageURL;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// ==========================================
// SAVE PROFILE
// ==========================================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        saveProfile
    );

}


async function saveProfile() {

    const name =
        nameInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const address =
        addressInput.value.trim();


    // ======================================
    // VALIDATION
    // ======================================

    if (!name) {

        showMessage(
            "Please enter your name.",
            "error"
        );

        nameInput.focus();

        return;

    }


    if (!phone) {

        showMessage(
            "Please enter your mobile number.",
            "error"
        );

        phoneInput.focus();

        return;

    }


    // ======================================
    // BUTTON LOADING
    // ======================================

    saveProfileBtn.disabled =
        true;

    saveProfileBtn.innerHTML =
        `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
        `;


    try {

        /*
         * NOTE:
         * API will be created in the next step.
         */

        const response =
            await fetch(
                "http://localhost:3000/api/profile/update",
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        userId:
                            Number(userId),

                        name:
                            name,

                        phone:
                            phone,

                        address:
                            address

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Profile Update:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update profile"
            );

        }


        // ==================================
        // UPDATE STORAGE
        // ==================================

        const storage =
            localStorage.getItem("userId")
                ? localStorage
                : sessionStorage;


        storage.setItem(
            "userName",
            name
        );


        storage.setItem(
            "userEmail",
            userEmail
        );


        // ==================================
        // UPDATE SCREEN
        // ==================================

        if (navUserName) {

            navUserName.textContent =
                name;

        }


        if (headerUserName) {

            headerUserName.textContent =
                name;

        }


        if (profileName) {

            profileName.textContent =
                name;

        }


        showMessage(
            "Profile updated successfully!",
            "success"
        );


    }

    catch (error) {

        console.error(
            "Profile Update Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );

    }

    finally {

        saveProfileBtn.disabled =
            false;

        saveProfileBtn.innerHTML =
            `
            <i class="fa-solid fa-floppy-disk"></i>
            Save Changes
            `;

    }

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    if (!profileMessage) {
        return;
    }


    profileMessage.textContent =
        message;


    if (type === "success") {

        profileMessage.style.color =
            "#18834b";

    }
    else {

        profileMessage.style.color =
            "#d13d4c";

    }


    setTimeout(
        () => {

            profileMessage.textContent =
                "";

        },
        4000
    );

}


// ==========================================
// LOGOUT HELPER
// ==========================================

function logoutUser() {

    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhoto");

    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userPhoto");

    window.location.href =
        "login.html";

}