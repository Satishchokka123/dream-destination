// ==========================================
// DREAM DESTINATIONS
// auth.js
// LOGIN + REGISTER
// ==========================================


// ==========================================
// API BASE URL
// ==========================================

const API_URL = "";


// ==========================================
// MESSAGE FUNCTION
// ==========================================

function showMessage(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(elementId);

    if (!element) return;


    element.innerText = message;

    element.className =
        "auth-message " + type;

}


// ==========================================
// BUTTON LOADING
// ==========================================

function setButtonLoading(
    button,
    loading,
    normalText
) {

    if (!button) return;


    if (loading) {

        button.disabled = true;

        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Please Wait...

        `;

    }

    else {

        button.disabled = false;

        button.innerHTML = normalText;

    }

}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {


    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const fullName =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const mobile =
                document.getElementById(
                    "mobile"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const terms =
                document.getElementById(
                    "terms"
                );


            const registerBtn =
                document.getElementById(
                    "registerBtn"
                );


            // ==============================
            // VALIDATION
            // ==============================

            if (!fullName) {

                showMessage(
                    "registerMessage",
                    "Please enter your full name.",
                    "error"
                );

                return;

            }


            if (!email) {

                showMessage(
                    "registerMessage",
                    "Please enter your email.",
                    "error"
                );

                return;

            }


            if (!/^\S+@\S+\.\S+$/.test(email)) {

                showMessage(
                    "registerMessage",
                    "Please enter a valid email address.",
                    "error"
                );

                return;

            }


            if (!/^[0-9]{10}$/.test(mobile)) {

                showMessage(
                    "registerMessage",
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                return;

            }


            if (password.length < 6) {

                showMessage(
                    "registerMessage",
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;

            }


            if (password !== confirmPassword) {

                showMessage(
                    "registerMessage",
                    "Passwords do not match.",
                    "error"
                );

                return;

            }


            if (!terms.checked) {

                showMessage(
                    "registerMessage",
                    "Please accept the Terms & Conditions.",
                    "error"
                );

                return;

            }


            // ==============================
            // LOADING
            // ==============================

            setButtonLoading(
                registerBtn,
                true
            );


            try {


                // ==========================
                // REGISTER API
                // ==========================

                const response =
                    await fetch(
                        `${API_URL}/api/register`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                name:
        fullName,

    email:
        email,

    phone:
        mobile,

    password:
        password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ==========================
                // API ERROR
                // ==========================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Registration failed."
                    );

                }


                // ==========================
                // SUCCESS
                // ==========================

                showMessage(
                    "registerMessage",
                    data.message ||
                    "Registration successful!",
                    "success"
                );


                registerForm.reset();


                // Redirect after success

                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );


            }

            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                showMessage(
                    "registerMessage",
                    error.message ||
                    "Unable to register. Please try again.",
                    "error"
                );

            }


            finally {

                setButtonLoading(
                    registerBtn,
                    false,

                    `
                    <i class="fa-solid fa-user-plus"></i>

                    Create Account
                    `
                );

            }

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const rememberMe =
                document.getElementById(
                    "rememberMe"
                );


            const loginBtn =
                document.getElementById(
                    "loginBtn"
                );


            // ==============================
            // VALIDATION
            // ==============================

            if (!email) {

                showMessage(
                    "loginMessage",
                    "Please enter your email.",
                    "error"
                );

                return;

            }


            if (!password) {

                showMessage(
                    "loginMessage",
                    "Please enter your password.",
                    "error"
                );

                return;

            }


            // ==============================
            // LOADING
            // ==============================

            setButtonLoading(
                loginBtn,
                true
            );


            try {


                // ==========================
                // LOGIN API
                // ==========================

                const response =
                    await fetch(
                        `${API_URL}/api/login`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                email:
                                    email,

                                password:
                                    password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ==========================
                // LOGIN ERROR
                // ==========================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Invalid email or password."
                    );

                }


                // ==========================
                // USER DATA
                // ==========================

                const user =
                    data.user || data;


                const userId =
                    user.id || "";


                const userName =
                    user.fullName ||
                    user.name ||
                    user.username ||
                    "";


                const userEmail =
                    user.email ||
                    email;


                // ==========================
                // STORAGE
                // ==========================

                const storage =
                    rememberMe.checked
                    ? localStorage
                    : sessionStorage;


                storage.setItem(
                    "userId",
                    userId
                );


                storage.setItem(
                    "userName",
                    userName
                );


                storage.setItem(
                    "userEmail",
                    userEmail
                );
           
                storage.setItem(
    "userPhoto",
    user.profilePhoto || ""
);


                storage.setItem(
                    "isLoggedIn",
                    "true"
                );


                // ==========================
                // SUCCESS
                // ==========================

                showMessage(
                    "loginMessage",
                    data.message ||
                    "Login successful!",
                    "success"
                );


                // ==========================
                // REDIRECT
                // ==========================

                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard1.html";

                    },
                    800
                );


            }

            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                showMessage(
                    "loginMessage",
                    error.message ||
                    "Login failed. Please try again.",
                    "error"
                );

            }


            finally {

                setButtonLoading(
                    loginBtn,
                    false,

                    `
                    <i class="fa-solid fa-right-to-bracket"></i>

                    Login
                    `
                );

            }

        }
    );

}


console.log(
    "✅ Dream Destinations Authentication Module Loaded Successfully"
);