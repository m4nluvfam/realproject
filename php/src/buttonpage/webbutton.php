<?php
session_start();

// เช็คว่าผู้ใช้ล็อกอินหรือไม่
if (!isset($_SESSION['user_id'])) {
    header("Location: ../loginpage/login.html"); // ถ้ายังไม่ได้ล็อกอิน ให้กลับไปหน้า Login
    exit();
}

// ดึง role ของผู้ใช้จาก Session
$user_role = $_SESSION['role'];
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KMITL News</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="webbutton.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;700&display=swap" rel="stylesheet">
</head>

<body>

    <div class="center-screen">
        <div class="container text-center mt-5">
            <h1 class="mb-4">KMITL News</h1>
            <p class="lead">ระบบประชาสัมพันธ์แบบรวมศูนย์</p>

            <!-- Buttons Section -->
            <div class="container text-center centered-container">
                <a href="../index.html" class="btn custom-btn custom-btn-home mb-3" role="button">หน้าหลัก</a>
                <a href="../postpage/post.html" class="btn custom-btn custom-btn-primary mb-3" role="button">ฟอร์มเขียนข่าวสาร</a>

                <!-- ปุ่มสำหรับ Admin เท่านั้น -->
                <?php if ($user_role == 2): ?>
                    <a href="../adminpage/admin.html" class="btn custom-btn custom-btn-secondary mb-3" role="button">สำหรับ Admin เท่านั้น</a>
                <?php else: ?>
                    <button class="btn custom-btn custom-btn-secondary" disabled>สำหรับ Admin เท่านั้น</button>
                <?php endif; ?>
            </div>
        </div>
    </div>

</body>

</html>
