<?php
session_start();
include 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo '<script>alert("Por favor, preencha todos os campos.");</script>';
    } else {
        $sql = "SELECT id, email, password FROM usuarios WHERE email = ?";
        $stmt = $mysqli->prepare($sql);

        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->bind_result($id, $dbEmail, $dbPassword);

            if ($stmt->fetch() && password_verify($password, $dbPassword)) {
                $_SESSION['logged_in'] = true;
                $_SESSION['user_id'] = $id;
                $_SESSION['email'] = $dbEmail;
                header('Location: home.php');
                exit();
            } else {
                echo '<script>alert("Credenciais incorretas.");</script>';
            }
            $stmt->close();
        } else {
            echo 'Erro ao preparar a declaração: ' . $mysqli->error;
        }
    }
}

$mysqli->close();
?>


<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login</title>
    <link rel="stylesheet" href="assets/css/login.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>

<body>
    <div id="form-sec">
        <form action="" method="POST">
            <h1>Login</h1>

            <label for="email">Endereço de Email:</label>
            <input type="email" name="email" id="email" autocomplete="email" required>

            <label for="password">Senha:</label>
            <input type="password" name="password" id="password" autocomplete="current-password" required>

            <button class="buttonForm" type="submit">Entrar</button>

            <p>Não tem uma conta? <a href="cadastro.php">Registre-se</a></p>
        </form>
    </div>
</body>

</html>