<?php
include 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($name) || empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
        echo 'Por favor, preencha todos os campos do formulário.';
        exit();
    }

    if (!$email) {
        echo 'Endereço de e-mail inválido.';
        exit();
    }

    if ($password !== $confirm_password) {
        echo 'As senhas não coincidem.';
        exit();
    }

    if (strlen($password) < 8) {
        echo 'A senha deve conter no mínimo 8 caracteres.';
        exit();
    }

    $sql = "INSERT INTO usuarios (nome, username, email, password) VALUES (?, ?, ?, ?)";
    $stmt = $mysqli->prepare($sql);

    if ($stmt) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt->bind_param('ssss', $name, $username, $email, $hashed_password);

        if ($stmt->execute()) {
            echo '<script>alert("Usuário cadastrado com sucesso!"); window.location.href = "login.php";</script>';
        } else {
            echo 'Erro ao realizar cadastro: ' . $stmt->error;
        }

        $stmt->close();
    } else {
        echo 'Erro ao preparar a declaração: ' . $mysqli->error;
    }
}

$mysqli->close();
?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>
    <link rel="stylesheet" href="assets/css/cadastro.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
</head>

<body>
    <div id="form-sec">
        <form action="" method="POST">
            <h1>Registrar-se</h1>

            <label for="name">Nome Completo:</label>
            <input type="text" name="name" id="name" autocomplete="name" required>

            <label for="username">Nome de Usuário:</label>
            <input type="text" name="username" id="username" autocomplete="username" required>

            <label for="email">Endereço de Email:</label>
            <input type="email" name="email" id="email" autocomplete="email" required>

            <label for="password">Senha:</label>
            <input type="password" name="password" id="password" autocomplete="new-password" required>

            <label for="confirm_password">Confirmar Senha:</label>
            <input type="password" name="confirm_password" id="confirm_password" autocomplete="new-password" required>

            <button class="buttonForm" type="submit">Registrar</button>

            <p>Eu tenho uma conta! <a href="login.php">Entrar</a></p>
        </form>

    </div>

</body>

</html>