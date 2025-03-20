document.addEventListener("DOMContentLoaded", function () {
    fetch("../../php/src/adminpage/get_user.php")
        .then(res => res.json())
        .then(data => {
            if (data.fullname && data.email) {
                const userInitials = data.fullname.split(" ").map(name => name[0].toUpperCase()).join("");
                document.getElementById("userInitials").innerText = userInitials;
                document.getElementById("userName").innerText = data.fullname;
                document.getElementById("userEmail").innerText = data.email;
            } else {
                alert("ไม่สามารถโหลดข้อมูลผู้ใช้");
            }
        })
        .catch(err => console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้:", err));


    let users = [];



    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });

    function togglePasswordVisibility() {
        const passwordField = document.getElementById("editPassword");
        const toggleButton = document.getElementById("togglePassword");

        if (passwordField && toggleButton) {
            if (passwordField.type === "password") {
                passwordField.type = "text";
                toggleButton.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            } else {
                passwordField.type = "password";
                toggleButton.innerHTML = '<i class="fa-regular fa-eye"></i>';
            }
        }
    }

    function renderUserTable(filterText = "") {
        let tableHTML = `
            <h1 class="title-link">User</h1>
            <hr>
            <input type="text" id="searchUser" class="form-control mb-3" placeholder="ค้นหาผู้ใช้...">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const filteredUsers = users.filter(user =>
            user.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
            user.email.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredUsers.length === 0) {
            tableHTML += `<tr><td colspan="4" class="text-center">ไม่พบผู้ใช้</td></tr>`;
        }

        filteredUsers.forEach((user, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.fullname}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="btn btn-outline-warning btn-sm edit-btn" data-id="${user.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        document.getElementById("pageContent").innerHTML = tableHTML;

        document.getElementById("searchUser").value = filterText;
        document.getElementById("searchUser").addEventListener("input", function () {
            renderUserTable(this.value);
        });

        addEditDeleteListeners();
    }

    function addEditDeleteListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-id');
                const user = users.find(user => user.id == userId);

                if (user) {
                    document.getElementById("editFullname").value = user.fullname;
                    document.getElementById("editEmail").value = user.email;
                    document.getElementById("editUsername").value = user.username;
                    document.getElementById("editPassword").value = user.password;

                    if (user.role === "Admin") {
                        document.getElementById("roleAdmin").checked = true;
                    } else {
                        document.getElementById("roleEditor").checked = true;
                    }

                    new bootstrap.Modal(document.getElementById('editUserModal')).show();

                    document.getElementById("togglePassword").addEventListener("click", togglePasswordVisibility);

                    document.getElementById("saveEditBtn").addEventListener("click", function () {
                        const updatedUser = {
                            id: parseInt(user.id),
                            fullname: document.getElementById("editFullname").value,
                            email: document.getElementById("editEmail").value,
                            username: document.getElementById("editUsername").value,
                            password: document.getElementById("editPassword").value,
                            role: document.querySelector('input[name="role"]:checked').value
                        };

                        fetch("../../php/src/adminpage/update_user.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(updatedUser)
                        })
                            .then(res => res.json())
                            .then(response => {
                                if (response.status === "success") {
                                    alert("อัปเดตผู้ใช้เรียบร้อยแล้ว");
                                    bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
                                    document.getElementById("userManagementBtn").click(); // reload user list
                                } else {
                                    alert("เกิดข้อผิดพลาด: " + response.message);
                                }
                            })
                            .catch(error => {
                                console.error("Error updating user:", error);
                                alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
                            });
                    });

                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-id');
                const userIndex = users.findIndex(user => user.id == userId);

                if (userIndex !== -1 && confirm("คุณแน่ใจว่าต้องการลบผู้ใช้รายนี้?")) {
                    users.splice(userIndex, 1);
                    renderUserTable();
                }
            });
        });
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    document.getElementById("userManagementBtn").addEventListener("click", () => {
        fetch("../../php/src/adminpage/admin.php")


            .then(res => res.json())
            .then(data => {
                users = data;
                renderUserTable();
            })
            .catch(err => {
                console.error("โหลดข้อมูลล้มเหลว", err);
                document.getElementById("pageContent").innerHTML = "<p class='text-danger'>ไม่สามารถโหลดรายชื่อผู้ใช้ได้</p>";
            });
    });

    // หน้าเพิ่มผู้ใช้
    document.getElementById("addUserBtn").addEventListener("click", function () {
        document.getElementById("pageContent").innerHTML = `
          <h1 class="title-link">Add User</h1>
          <hr>
          <form id="addUserForm">
              <div class="mb-3">
                  <label for="newFullname" class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="newFullname" required>
              </div>
              <div class="mb-3">
                  <label for="newEmail" class="form-label">Email</label>
                  <input type="email" class="form-control" id="newEmail" required>
              </div>
              <div class="mb-3">
                  <label for="newUsername" class="form-label">Username</label>
                  <input type="text" class="form-control" id="newUsername" required>
              </div>
              <div class="mb-3">
                  <label for="newPassword" class="form-label">Password</label>
                  <input type="password" class="form-control" id="newPassword" required>
              </div>
              <div class="mb-3">
                  <label class="form-label">Role</label><br>
                  <input type="radio" id="newRoleAdmin" name="role" value="Admin" required> Admin
                  <input type="radio" id="newRoleEditor" name="role" value="Editor" required> Editor
              </div>
              <div class="d-flex justify-content-end">
                  <button type="reset" class="btn btn-secondary me-2">Clear</button>
                  <button type="submit" class="btn btn-success">Add User</button>
              </div>
          </form>
        `;

        document.getElementById("addUserForm").addEventListener("submit", function (e) {
            e.preventDefault();

            const newUser = {
                fullname: document.getElementById("newFullname").value,
                email: document.getElementById("newEmail").value,
                username: document.getElementById("newUsername").value,
                password: document.getElementById("newPassword").value,
                role: document.querySelector('input[name="role"]:checked').value
            };

            fetch("../../php/src/adminpage/add_user.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            })
                .then(res => res.json())
                .then(response => {
                    if (response.status === "success") {
                        alert("เพิ่มข้อมูลผู้ใช้เรียบร้อยแล้ว");
                        document.getElementById("userManagementBtn").click(); // โหลดตารางใหม่
                    } else {
                        alert("เกิดข้อผิดพลาด: " + response.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                });
        });

    });

    document.getElementById("logoutBtn")?.addEventListener("click", function () {
        fetch("logout.php", { method: "POST" }) // ✅ เรียก PHP เพื่อลบ session
            .then(response => {
                if (response.ok) {
                    window.location.href = "../index.html"; // ✅ กลับไปหน้า index.html
                } else {
                    alert("Logout failed!");
                }
            })
            .catch(() => {
                alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            });
    });

});
