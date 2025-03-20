<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include '../connect.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (empty($_POST['username']) || empty($_POST['password'])) {
        echo "<script>alert('กรุณากรอกข้อมูลให้ครบถ้วน'); window.location.href='login.html';</script>";
        exit();
    }

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $sql = "SELECT ed_id, ed_name, ed_email, ed_username, ed_password, ed_role FROM tb_editor WHERE ed_username = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("เกิดข้อผิดพลาดในการเตรียม SQL: " . $conn->error);
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        if (password_verify($password, $row['ed_password']) || $password === $row['ed_password']) {
            session_regenerate_id(true);

            // บันทึกข้อมูลผู้ใช้ใน session
            $_SESSION['user_id'] = $row['ed_id'];
            $_SESSION['username'] = $row['ed_username'];
            $_SESSION['role'] = $row['ed_role'];
            $_SESSION['user'] = [
                'fullname' => $row['ed_name'],
                'email' => $row['ed_email']
            ];

            header("Location: ../buttonpage/webbutton.php");
            exit();
        } else {
            echo "<script>alert('รหัสผ่านไม่ถูกต้อง'); window.location.href='login.html';</script>";
            exit();
        }
    } else {
        echo "<script>alert('ไม่มีผู้ใช้งานนี้'); window.location.href='login.html';</script>";
        exit();
    }

    $stmt->close();
    $conn->close();
}
?>