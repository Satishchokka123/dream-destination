// =====================================================
// DREAM DESTINATIONS
// booking.js
// Clean & Correct Version
// =====================================================

const API_BASE = "http://localhost:3000";

// =====================================================
// GLOBAL VARIABLES
// =====================================================

const params = new URLSearchParams(window.location.search);

const packageId = params.get("id");

let packageData = {};
let packagePrice = 0;

let pickupCharge = 0;
let transportCharge = 0;
let hotelCharge = 0;

let extraServices = [];

let bookingSubmitting = false;


// =====================================================
// DOM HELPER
// =====================================================

function getElement(id) {
    return document.getElementById(id);
}


// =====================================================
// GET LOGGED-IN USER ID
// =====================================================

function getLoggedInUserId() {

    // -----------------------------------------
    // 1. Direct userId
    // -----------------------------------------

    let userId =
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId");

    if (userId) {
        return userId;
    }


    // -----------------------------------------
    // 2. user_id
    // -----------------------------------------

    userId =
        localStorage.getItem("user_id") ||
        sessionStorage.getItem("user_id");

    if (userId) {
        return userId;
    }


    // -----------------------------------------
    // 3. Stored user object
    // -----------------------------------------

    const storedUsers = [
        localStorage.getItem("user"),
        localStorage.getItem("currentUser"),
        sessionStorage.getItem("user"),
        sessionStorage.getItem("currentUser")
    ];


    for (const stored of storedUsers) {

        if (!stored) {
            continue;
        }

        try {

            const user = JSON.parse(stored);

            if (user && user.id) {

                return user.id;

            }

        }
        catch (error) {

            console.log(
                "Stored user parsing error:",
                error
            );

        }

    }


    return null;
}


// =====================================================
// LOAD PACKAGE
// =====================================================

async function loadPackage() {

    if (!packageId) {

        alert("Package ID not found.");

        window.location.href =
            "package.html";

        return;

    }


    try {

        const response = await fetch(
            `${API_BASE}/api/packages/${packageId}`
        );


        if (!response.ok) {

            throw new Error(
                "Package not found"
            );

        }


        packageData =
            await response.json();


        packagePrice =
            Number(
                packageData.base_price || 0
            );


        // -----------------------------------------
        // Package Image
        // -----------------------------------------

        const packageImage =
            getElement("packageImage");

        if (packageImage) {

            packageImage.src =
                `${API_BASE}/images/packages/${packageData.image}`;

        }


        // -----------------------------------------
        // Package Name
        // -----------------------------------------

        const packageName =
            getElement("packageName");

        if (packageName) {

            packageName.innerText =
                packageData.package_name || "-";

        }


        // -----------------------------------------
        // Category
        // -----------------------------------------

        const packageCategory =
            getElement("packageCategory");

        if (packageCategory) {

            packageCategory.innerText =
                packageData.category || "-";

        }


        // -----------------------------------------
        // Destination
        // -----------------------------------------

        const packageDestination =
            getElement("packageDestination");

        if (packageDestination) {

            packageDestination.innerText =
                packageData.destination || "-";

        }


        // -----------------------------------------
        // Duration
        // -----------------------------------------

        const packageDuration =
            getElement("packageDuration");

        if (packageDuration) {

            packageDuration.innerText =
                packageData.duration || "-";

        }


        // -----------------------------------------
        // Package Price
        // -----------------------------------------

        const packagePriceElement =
            getElement("packagePrice");

        if (packagePriceElement) {

            packagePriceElement.innerText =
                packagePrice.toLocaleString("en-IN");

        }


        const summaryPackagePrice =
            getElement("summaryPackagePrice");

        if (summaryPackagePrice) {

            summaryPackagePrice.innerText =
                packagePrice.toLocaleString("en-IN");

        }


        // -----------------------------------------
        // Destination hidden/input field
        // -----------------------------------------

        const destinationInput =
            getElement("destination");

        if (destinationInput) {

            destinationInput.value =
                packageData.destination || "";

        }


        calculateTotal();

    }

    catch (error) {

        console.error(
            "Package Loading Error:",
            error
        );


        alert(
            "Unable to load package."
        );

        window.location.href =
            "package.html";

    }

}


// =====================================================
// CALCULATE TOTAL
// =====================================================

function calculateTotal() {

    const adultsElement =
        getElement("adults");

    const childrenElement =
        getElement("children");


    const adults =
        Number(
            adultsElement?.value || 0
        );


    const children =
        Number(
            childrenElement?.value || 0
        );


    // -----------------------------------------
    // Package amount
    // -----------------------------------------

    let total = 0;


    total +=
        adults * packagePrice;


    // Children = 50% of adult package price

    total +=
        children *
        (packagePrice * 0.5);


    // -----------------------------------------
    // Pickup
    // -----------------------------------------

    total += pickupCharge;


    const pickupElement =
        getElement("pickupCharge");

    if (pickupElement) {

        pickupElement.innerText =
            pickupCharge.toLocaleString("en-IN");

    }


    // -----------------------------------------
    // Transport
    // -----------------------------------------

    total += transportCharge;


    const transportElement =
        getElement("transportCharge");

    if (transportElement) {

        transportElement.innerText =
            transportCharge.toLocaleString("en-IN");

    }


    // -----------------------------------------
    // Hotel
    // -----------------------------------------

    total += hotelCharge;


    const hotelElement =
        getElement("hotelCharge");

    if (hotelElement) {

        hotelElement.innerText =
            hotelCharge.toLocaleString("en-IN");

    }


    // -----------------------------------------
    // Extra Services
    // -----------------------------------------

    let extraServicesTotal = 0;


    document
        .querySelectorAll(
            ".extra-service:checked"
        )
        .forEach(service => {

            const charge =
                Number(
                    service.dataset.charge || 0
                );


            const chargeType =
                String(
                    service.dataset.chargeType || ""
                ).trim();


            if (
                chargeType.toLowerCase() ===
                "per person"
            ) {

                extraServicesTotal +=
                    (adults + children) *
                    charge;

            }


            else {

                extraServicesTotal +=
                    charge;

            }

        });


    total +=
        extraServicesTotal;


    // -----------------------------------------
    // Summary
    // -----------------------------------------

    const summaryAdults =
        getElement("summaryAdults");

    if (summaryAdults) {

        summaryAdults.innerText =
            adults;

    }


    const summaryChildren =
        getElement("summaryChildren");

    if (summaryChildren) {

        summaryChildren.innerText =
            children;

    }


    const summaryPackagePrice =
        getElement("summaryPackagePrice");

    if (summaryPackagePrice) {

        summaryPackagePrice.innerText =
            packagePrice.toLocaleString("en-IN");

    }


    const summaryPickupCharge =
        getElement("summaryPickupCharge");

    if (summaryPickupCharge) {

        summaryPickupCharge.innerText =
            pickupCharge.toLocaleString("en-IN");

    }


    const summaryTransportCharge =
        getElement("summaryTransportCharge");

    if (summaryTransportCharge) {

        summaryTransportCharge.innerText =
            transportCharge.toLocaleString("en-IN");

    }


    const summaryHotelCharge =
        getElement("summaryHotelCharge");

    if (summaryHotelCharge) {

        summaryHotelCharge.innerText =
            hotelCharge.toLocaleString("en-IN");

    }


    const serviceCharge =
        getElement("serviceCharge");

    if (serviceCharge) {

        serviceCharge.innerText =
            extraServicesTotal.toLocaleString("en-IN");

    }


    const totalPrice =
        getElement("totalPrice");

    if (totalPrice) {

        totalPrice.innerText =
            total.toLocaleString("en-IN");

    }


    return total;

}


// =====================================================
// LOAD PICKUP CITIES
// =====================================================

async function loadPickupCities() {

    const select =
        getElement("from_city");


    if (!select) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/pickup-cities/active`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load pickup cities"
            );

        }


        const cities =
            await response.json();


        select.innerHTML =
            `<option value="">Select Pickup City</option>`;


        cities.forEach(city => {

            const option =
                document.createElement("option");


            option.value =
                city.city_name;


            option.textContent =
                city.city_name;


            option.dataset.charge =
                city.charge || 0;


            select.appendChild(option);

        });


        select.addEventListener(
            "change",
            function () {

                const selectedOption =
                    this.options[
                        this.selectedIndex
                    ];


                pickupCharge =
                    Number(
                        selectedOption?.dataset
                            ?.charge || 0
                    );


                calculateTotal();

            }
        );

    }

    catch (error) {

        console.error(
            "Pickup City Error:",
            error
        );

        select.innerHTML =
            `<option value="">
                Unable to load pickup cities
            </option>`;

    }

}


// =====================================================
// LOAD TRANSPORT
// =====================================================

async function loadTransport() {

    const select =
        getElement("transport");


    if (!select) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/transport-charges/active`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load transport"
            );

        }


        const transports =
            await response.json();


        select.innerHTML =
            `<option value="">
                Select Transport
            </option>`;


        transports.forEach(item => {

            const option =
                document.createElement("option");


            option.value =
                item.transport_name;


            option.textContent =
                item.transport_name;


            option.dataset.charge =
                item.charge || 0;


            select.appendChild(option);

        });


        select.addEventListener(
            "change",
            function () {

                const selectedOption =
                    this.options[
                        this.selectedIndex
                    ];


                transportCharge =
                    Number(
                        selectedOption?.dataset
                            ?.charge || 0
                    );


                calculateTotal();

            }
        );

    }

    catch (error) {

        console.error(
            "Transport Loading Error:",
            error
        );

        select.innerHTML =
            `<option value="">
                Unable to load transport
            </option>`;

    }

}


// =====================================================
// LOAD HOTELS
// =====================================================

async function loadHotels() {

    const select =
        getElement("hotel");


    if (!select) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/hotel-charges/active`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load hotels"
            );

        }


        const hotels =
            await response.json();


        select.innerHTML =
            `<option value="">
                Select Hotel
            </option>`;


        hotels.forEach(item => {

            const option =
                document.createElement("option");


            option.value =
                item.hotel_type;


            option.textContent =
                item.hotel_type;


            option.dataset.charge =
                item.charge || 0;


            select.appendChild(option);

        });


        select.addEventListener(
            "change",
            function () {

                const selectedOption =
                    this.options[
                        this.selectedIndex
                    ];


                hotelCharge =
                    Number(
                        selectedOption?.dataset
                            ?.charge || 0
                    );


                calculateTotal();

            }
        );

    }

    catch (error) {

        console.error(
            "Hotel Loading Error:",
            error
        );

        select.innerHTML =
            `<option value="">
                Unable to load hotels
            </option>`;

    }

}


// =====================================================
// LOAD EXTRA SERVICES
// =====================================================

async function loadExtraServices() {

    const container =
        getElement(
            "extraServicesContainer"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/extra-services/active`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load extra services"
            );

        }


        extraServices =
            await response.json();


        container.innerHTML = "";


        if (
            !Array.isArray(extraServices) ||
            extraServices.length === 0
        ) {

            container.innerHTML =
                "<p>No extra services available.</p>";

            calculateTotal();

            return;

        }


        extraServices.forEach(service => {

            const item =
                document.createElement("div");


            item.className =
                "extra-service-item";


            const label =
                document.createElement("label");


            const checkbox =
                document.createElement("input");


            checkbox.type =
                "checkbox";


            checkbox.className =
                "extra-service";


            checkbox.value =
                service.id;


            checkbox.dataset.charge =
                service.charge || 0;


            checkbox.dataset.chargeType =
                service.charge_type || "Fixed";


            checkbox.addEventListener(
                "change",
                calculateTotal
            );


            const serviceName =
                document.createElement("span");


            serviceName.textContent =
                service.service_name;


            label.appendChild(
                checkbox
            );


            label.appendChild(
                serviceName
            );


            const charge =
                document.createElement("span");


            const amount =
                Number(
                    service.charge || 0
                );


            charge.textContent =
                `₹${amount.toLocaleString("en-IN")}` +
                (
                    String(
                        service.charge_type || ""
                    ).toLowerCase() ===
                    "per person"
                        ? " / Person"
                        : " Fixed"
                );


            item.appendChild(label);

            item.appendChild(charge);


            container.appendChild(item);

        });


        calculateTotal();

    }

    catch (error) {

        console.error(
            "Extra Services Error:",
            error
        );


        container.innerHTML =
            "<p>Unable to load extra services.</p>";

    }

}


// =====================================================
// GET INPUT VALUE
// =====================================================

function getValue(id) {

    const element =
        getElement(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


// =====================================================
// CREATE BOOKING
// =====================================================

async function createBooking(event) {

    if (event) {

        event.preventDefault();

    }


    // Prevent double click

    if (bookingSubmitting) {

        return;

    }


    bookingSubmitting = true;


    const confirmButton =
        getElement(
            "confirmBookingBtn"
        );


    if (confirmButton) {

        confirmButton.disabled =
            true;

        confirmButton.innerText =
            "Creating Booking...";

    }


    try {

        // -----------------------------------------
        // USER ID
        // -----------------------------------------

        const userId =
            getLoggedInUserId();


        console.log(
            "Logged-in User ID:",
            userId
        );


        if (!userId) {

            alert(
                "Please login before booking."
            );

            bookingSubmitting = false;


            if (confirmButton) {

                confirmButton.disabled =
                    false;

                confirmButton.innerText =
                    "✓ Confirm Booking";

            }


            return;

        }


        // -----------------------------------------
        // PACKAGE ID
        // -----------------------------------------

        if (!packageId) {

            throw new Error(
                "Package ID not found."
            );

        }


        // -----------------------------------------
        // TOTAL
        // -----------------------------------------

        const total =
            calculateTotal();


        if (!total || total <= 0) {

            throw new Error(
                "Invalid booking total."
            );

        }


        // -----------------------------------------
        // BOOKING DATA
        // -----------------------------------------

        const booking = {

            user_id:
                Number(userId),

            package_id:
                Number(packageId),

            full_name:
                getValue("full_name"),

            email:
                getValue("email"),

            mobile:
                getValue("mobile"),

            gender:
                getValue("gender"),

            address:
                getValue("address"),

            from_city:
                getValue("from_city"),

            destination:
                getValue("destination") ||
                packageData.destination ||
                "",

            travel_date:
                getValue("travel_date"),

            return_date:
                getValue("return_date"),

            adults:
                Number(
                    getElement("adults")?.value || 0
                ),

            children:
                Number(
                    getElement("children")?.value || 0
                ),

            transport:
                getValue("transport"),

            hotel:
                getValue("hotel"),

            total_price:
                Number(total)

        };


        console.log(
            "BOOKING DATA SENT TO SERVER:",
            booking
        );


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (
            !booking.full_name ||
            !booking.email ||
            !booking.mobile
        ) {

            throw new Error(
                "Please fill all customer details."
            );

        }


        if (!booking.travel_date) {

            throw new Error(
                "Please select travel date."
            );

        }


        if (
            booking.adults <= 0 &&
            booking.children <= 0
        ) {

            throw new Error(
                "Please select at least one traveller."
            );

        }


        // -----------------------------------------
        // CREATE BOOKING API
        // -----------------------------------------

        const response =
            await fetch(
                `${API_BASE}/api/bookings`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(booking)

                }
            );


        // -----------------------------------------
        // READ SERVER RESPONSE
        // -----------------------------------------

        let result;

        try {

            result =
                await response.json();

        }

        catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log(
            "CREATE BOOKING RESPONSE:",
            result
        );


        // -----------------------------------------
        // ERROR
        // -----------------------------------------

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to create booking."
            );

        }


        // -----------------------------------------
        // BOOKING ID
        // -----------------------------------------

        const bookingId =
            result.bookingId;


        if (!bookingId) {

            throw new Error(
                "Booking created but Booking ID was not returned."
            );

        }


        console.log(
            "BOOKING CREATED:",
            bookingId
        );


        // -----------------------------------------
        // GO TO PAYMENT PAGE
        // -----------------------------------------

        window.location.href =
            `payment.html?bookingId=${bookingId}`;

    }

    catch (error) {

        console.error(
            "BOOKING ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to create booking."
        );


        bookingSubmitting = false;


        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.innerText =
                "✓ Confirm Booking";

        }

    }

}


// =====================================================
// AUTO FILL USER DETAILS
// =====================================================

function loadUserDetails() {

    const storedUsers = [

        localStorage.getItem("user"),

        localStorage.getItem("currentUser"),

        sessionStorage.getItem("user"),

        sessionStorage.getItem("currentUser")

    ];


    let user = null;


    for (const stored of storedUsers) {

        if (!stored) {
            continue;
        }


        try {

            const parsed =
                JSON.parse(stored);


            if (parsed) {

                user = parsed;

                break;

            }

        }

        catch (error) {

            console.log(
                "User data parsing error"
            );

        }

    }


    if (!user) {
        return;
    }


    // Name

    const name =
        getElement("full_name");

    if (
        name &&
        !name.value &&
        (user.name || user.full_name)
    ) {

        name.value =
            user.name ||
            user.full_name;

    }


    // Email

    const email =
        getElement("email");

    if (
        email &&
        !email.value &&
        user.email
    ) {

        email.value =
            user.email;

    }


    // Mobile

    const mobile =
        getElement("mobile");

    if (
        mobile &&
        !mobile.value &&
        (user.phone || user.mobile)
    ) {

        mobile.value =
            user.phone ||
            user.mobile;

    }


    // Address

    const address =
        getElement("address");

    if (
        address &&
        !address.value &&
        user.address
    ) {

        address.value =
            user.address;

    }

}


// =====================================================
// INPUT CHANGE EVENTS
// =====================================================

function setupInputEvents() {

    const adults =
        getElement("adults");


    const children =
        getElement("children");


    if (adults) {

        adults.addEventListener(
            "input",
            calculateTotal
        );

    }


    if (children) {

        children.addEventListener(
            "input",
            calculateTotal
        );

    }

}


// =====================================================
// CONFIRM BUTTON
// =====================================================

function setupConfirmButton() {

    const button =
        getElement(
            "confirmBookingBtn"
        );


    if (!button) {

        console.warn(
            "confirmBookingBtn not found"
        );

        return;

    }


    // Important:
    // Prevent the button from submitting
    // the form twice.

    button.type =
        "button";


    button.addEventListener(
        "click",
        createBooking
    );

}


// =====================================================
// FORM SUBMIT
// =====================================================

function setupForm() {

    const form =
        getElement(
            "bookingForm"
        );


    if (!form) {
        return;
    }


    // Remove normal browser submit

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            createBooking(event);

        }
    );

}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "================================="
        );

        console.log(
            "Dream Destinations Booking Page"
        );

        console.log(
            "Package ID:",
            packageId
        );

        console.log(
            "User ID:",
            getLoggedInUserId()
        );

        console.log(
            "================================="
        );


        loadUserDetails();


        setupInputEvents();


        setupConfirmButton();


        // Do NOT add another booking
        // click listener anywhere else.


        await Promise.all([

            loadPackage(),

            loadPickupCities(),

            loadTransport(),

            loadHotels(),

            loadExtraServices()

        ]);


        calculateTotal();

    }
);