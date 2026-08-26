// ==========================================
// DREAM DESTINATIONS
// manage-users.js
// MANAGE USERS
// ==========================================

let allUsers = [];


// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    const table =
        document.getElementById("userTable");

    if (!table) return;


    table.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading users...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "http://localhost:3000/api/users"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load users"
            );

        }


        const data =
            await response.json();


        console.log(
            "Users received:",
            data
        );


        allUsers =
            Array.isArray(data)
                ? data
                : [];


        updateStatistics();

        displayUsers(allUsers);

    }

    catch (error) {

        console.error(
            "User Load Error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="no-data"
                >
                    Unable to load users.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const totalUsers =
        allUsers.length;


    const activeUsers =
        allUsers.filter(
            user =>
                String(
                    user.status || ""
                ).toLowerCase() === "active"
        ).length;


    const blockedUsers =
        allUsers.filter(
            user =>
                String(
                    user.status || ""
                ).toLowerCase() === "blocked"
        ).length;


    const today =
        new Date();


    const todayDate =
        today.toDateString();


    const newUsers =
        allUsers.filter(user => {

            if (!user.created_at) {
                return false;
            }


            const created =
                new Date(
                    user.created_at
                );


            return (
                created.toDateString()
                ===
                todayDate
            );

        }).length;


    setText(
        "totalUsers",
        totalUsers
    );


    setText(
        "activeUsers",
        activeUsers
    );


    setText(
        "blockedUsers",
        blockedUsers
    );


    setText(
        "newUsers",
        newUsers
    );

}


// ==========================================
// DISPLAY USERS
// ==========================================

function displayUsers(users) {

    const table =
        document.getElementById(
            "userTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (
        !users ||
        users.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="no-data"
                >
                    No users found.
                </td>
            </tr>
        `;

        return;

    }


    users.forEach(user => {

        const status =
            String(
                user.status || "Active"
            ).trim();


        const statusClass =
            status.toLowerCase()
            === "active"
                ? "active"
                : "blocked";


        table.innerHTML += `

            <tr>

                <!-- ID -->

                <td>

                    #${user.id}

                </td>


                <!-- USER -->

                <td>

                    <div class="user-info">

                        <div class="user-avatar">

                            ${
                                getInitial(
                                    user.name
                                )
                            }

                        </div>

                        <div>

                            <strong>

                                ${escapeHTML(
                                    user.name ||
                                    "Unknown User"
                                )}

                            </strong>

                            
                        </div>

                    </div>

                </td>

               
<td>

    ${escapeHTML(
        user.email || "-"
    )}

</td>


                <!-- PHONE -->

                <td>

                    ${escapeHTML(
                        user.phone ||
                        "-"
                    )}

                </td>


                <!-- STATUS -->

                <td>

                    <span
                        class="
                            user-status
                            ${statusClass}
                        "
                    >

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </td>


                <!-- CREATED -->

                <td>

                    ${formatDate(
                        user.created_at
                    )}

                </td>


                <!-- ACTIONS -->

                <td>

                    <div class="action-buttons">


                        <!-- VIEW -->

                        <button
                            class="view-btn"
                            onclick="
                                viewUser(
                                    ${user.id}
                                )
                            "
                            title="View User"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-eye
                                "
                            ></i>

                        </button>


                        <!-- BLOCK / UNBLOCK -->

                        ${
                            status
                                .toLowerCase()
                            ===
                            "active"

                            ? `

                            <button
                                class="block-btn"
                                onclick="
                                    updateUserStatus(
                                        ${user.id},
                                        'Blocked'
                                    )
                                "
                                title="Block User"
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-ban
                                    "
                                ></i>

                            </button>

                            `

                            :

                            `

                            <button
                                class="activate-btn"
                                onclick="
                                    updateUserStatus(
                                        ${user.id},
                                        'Active'
                                    )
                                "
                                title="Activate User"
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-check
                                    "
                                ></i>

                            </button>

                            `
                        }


                        <!-- DELETE -->

                        <button
                            class="delete-btn"
                            onclick="
                                deleteUser(
                                    ${user.id}
                                )
                            "
                            title="Delete User"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-trash
                                "
                            ></i>

                        </button>


                    </div>

                </td>

            </tr>

        `;

    });

}


// ==========================================
// SEARCH
// ==========================================

function filterUsers() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        allUsers.filter(user => {

            const name =
                String(
                    user.name || ""
                ).toLowerCase();


            const email =
                String(
                    user.email || ""
                ).toLowerCase();


            const phone =
                String(
                    user.phone || ""
                ).toLowerCase();


            return (
                name.includes(search) ||
                email.includes(search) ||
                phone.includes(search)
            );

        });


    displayUsers(filtered);

}


// ==========================================
// VIEW USER
// ==========================================

async function viewUser(userId) {

    try {

        const response =
            await fetch(
                `http://localhost:3000/api/users/${userId}`
            );


        const user =
            await response.json();


        if (!response.ok) {

            throw new Error(
                user.message ||
                "Unable to load user"
            );

        }


        const details =
            document.getElementById(
                "userDetails"
            );


        if (!details) {

            alert(
                `
                Name: ${user.name}
                Email: ${user.email}
                Phone: ${user.phone || "-"}
                Status: ${user.status || "-"}
                Address: ${user.address || "-"}
                `
            );

            return;

        }


        details.innerHTML = `

            <div class="user-detail">

                <h3>
                    ${escapeHTML(
                        user.name ||
                        "Unknown User"
                    )}
                </h3>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        user.email ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(
                        user.phone ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHTML(
                        user.status ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${escapeHTML(
                        user.address ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>Joined:</strong>
                    ${formatDate(
                        user.created_at
                    )}
                </p>

            </div>

        `;


        const modal =
            document.getElementById(
                "userModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }

    }

    catch (error) {

        console.error(
            "View User Error:",
            error
        );


        alert(
            error.message ||
            "Unable to load user"
        );

    }

}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateUserStatus(
    userId,
    newStatus
) {

    const message =
        newStatus === "Blocked"

            ? "Block this user?"

            : "Activate this user?";


    if (!confirm(message)) {

        return;

    }


    try {

        const response =
            await fetch(

                `http://localhost:3000/api/users/${userId}/status`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to update user status"
            );

        }


        alert(
            result.message ||
            "User status updated successfully"
        );


        await loadUsers();

    }

    catch (error) {

        console.error(
            "Status Update Error:",
            error
        );


        alert(
            error.message ||
            "Unable to update user status"
        );

    }

}


// ==========================================
// DELETE USER
// ==========================================

async function deleteUser(userId) {

    if (
        !confirm(
            "Are you sure you want to delete this user?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(

                `http://localhost:3000/api/users/${userId}`,

                {

                    method: "DELETE"

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete user"
            );

        }


        alert(
            result.message ||
            "User deleted successfully"
        );


        await loadUsers();

    }

    catch (error) {

        console.error(
            "Delete User Error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete user"
        );

    }

}


// ==========================================
// CLOSE USER MODAL
// ==========================================

const closeUserModal =
    document.getElementById(
        "closeUserModal"
    );


if (closeUserModal) {

    closeUserModal.addEventListener(
        "click",
        function () {

            const modal =
                document.getElementById(
                    "userModal"
                );


            if (modal) {

                modal.style.display =
                    "none";

            }

        }
    );

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "userModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


// ==========================================
// SEARCH EVENT
// ==========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterUsers
    );

}


// ==========================================
// HELPERS
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


function getInitial(name) {

    if (!name) {

        return "U";

    }


    return String(name)
        .trim()
        .charAt(0)
        .toUpperCase();

}


function formatDate(date) {

    if (!date) {

        return "-";

    }


    const d =
        new Date(date);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    return String(
        value || ""
    )
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
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadUsers();

    }
);


console.log(
    "✅ Manage Users Module Loaded"
);