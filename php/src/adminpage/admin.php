<?php
 include '../connect.php';

$sql = "SELECT ed_id, ed_name, ed_email, ed_username, ed_password, ed_role FROM tb_editor";
$result = $conn->query($sql);

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = [
        "id" => $row['ed_id'],
        "fullname" => $row['ed_name'],
        "email" => $row['ed_email'],
        "username" => $row['ed_username'],
        "password" => $row['ed_password'],
        "role" => $row['ed_role'] == 2 ? "Admin" : "Editor"
    ];
}

echo json_encode($users);
$conn->close();
?>
