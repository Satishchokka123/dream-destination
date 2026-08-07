function editProfile(){

alert("Edit Profile Page Coming Soon");

}

function viewBookings(){

window.location.href="booking.html";

}

function wishlist(){

window.location.href="wishlist.html";

}

function logout(){

localStorage.removeItem("user");

window.location.href="login.html";

}
fetch("/api/profile")
.then(res=>res.json())
.then(data=>{

    document.getElementById("name").innerHTML = data.user.name;

    document.getElementById("email").innerHTML = data.user.email;

})
.catch(error=>{

    alert("Please Login First");
    window.location.href="login.html";

});