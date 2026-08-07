// ======================================
// Dream Destinations - Admin Login
// ======================================

// Show / Hide Password

const togglePassword = document.getElementById("togglePassword");

const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){

        password.type = "text";

        togglePassword.classList.remove("fa-eye");

        togglePassword.classList.add("fa-eye-slash");

    }
    else{

        password.type = "password";

        togglePassword.classList.remove("fa-eye-slash");

        togglePassword.classList.add("fa-eye");

    }

});


// ======================================
// Admin Login
// ======================================

document.getElementById("adminLoginForm")

.addEventListener("submit", function(e){

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    fetch("http://localhost:3000/api/admin/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email:email,

            password:password

        })

    })

    .then(response=>response.json())

    .then(data=>{

        if(data.success){

            alert("Login Successful");

            window.location.href="dashboard.html";

        }

        else{

            alert(data.message);

        }

    })

    .catch(error=>{

        console.log(error);

        alert("Server Error");

    });

});