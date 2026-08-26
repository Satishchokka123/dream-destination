// ==========================================
// DREAM DESTINATIONS
// common-user.js
// Dynamic Logged-in User
// ==========================================


// ==========================================
// GET USER DATA
// ==========================================

function getLoggedUser() {

    const storage =
        localStorage.getItem("userId")
            ? localStorage
            : sessionStorage;


    return {

        id:
            storage.getItem("userId") || "",

        name:
            storage.getItem("userName") || "User",

        email:
            storage.getItem("userEmail") || "",

        phone:
            storage.getItem("userPhone") || "",

        photo:
            storage.getItem("userPhoto") || ""

    };

}


// ==========================================
// CHECK LOGIN
// ==========================================

function isUserLoggedIn() {

    return !!(
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId")
    );

}


// ==========================================
// DISPLAY USER NAME
// ==========================================

function loadUserName() {

    const user =
        getLoggedUser();


    const nameElements =
        document.querySelectorAll(
            "[data-user-name]"
        );


    nameElements.forEach(
        element => {

            element.innerText =
                user.name || "User";

        }
    );

}


// ==========================================
// DISPLAY USER EMAIL
// ==========================================

function loadUserEmail() {

    const user =
        getLoggedUser();


    const emailElements =
        document.querySelectorAll(
            "[data-user-email]"
        );


    emailElements.forEach(
        element => {

            element.innerText =
                user.email || "";

        }
    );

}


// ==========================================
// DISPLAY USER PHONE
// ==========================================

function loadUserPhone() {

    const user =
        getLoggedUser();


    const phoneElements =
        document.querySelectorAll(
            "[data-user-phone]"
        );


    phoneElements.forEach(
        element => {

            element.innerText =
                user.phone || "";

        }
    );

}


// ==========================================
// DISPLAY USER PHOTO
// ==========================================

function loadUserPhoto() {

    const user =
        getLoggedUser();


    const photoElements =
        document.querySelectorAll(
            "[data-user-photo]"
        );


    photoElements.forEach(
        element => {

            if (user.photo) {

                element.src =
                    user.photo;

            }

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
        "userPhone"
    );

    localStorage.removeItem(
        "userPhoto"
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
        "userPhone"
    );

    sessionStorage.removeItem(
        "userPhoto"
    );

    sessionStorage.removeItem(
        "isLoggedIn"
    );


    window.location.href =
        "login.html";

}


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUserName();

        loadUserEmail();

        loadUserPhone();

        loadUserPhoto();

    }
);


console.log(
    "✅ Common Dynamic User Module Loaded"
);