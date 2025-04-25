<?php
include 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['email']) && isset($_POST['password'])) {
        $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
        $password = $_POST['password'];

        if (strlen($password) < 8) {
            echo 'A senha deve conter no mínimo 8 caracteres.';
            exit();
        }

        if (empty($email) || empty($password)) {
            echo 'Por favor, preencha todos os campos do formulário.';
            exit();
        }

        $sql = "INSERT INTO usuarios (email, password) VALUES (?, ?)";
        $stmt = $mysqli->prepare($sql);

        if ($stmt) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt->bind_param('ss', $email, $hashed_password);

            if ($stmt->execute()) {
                echo '<script>alert("Usuário realizado com sucesso!");window.location.href=("login.php");</script>';
            } else {
                echo 'Erro ao realizar cadastro.';
            }
            $stmt->close();
        } else {
            echo 'Erro ao preparar a declaração: ' . $mysqli->error;
        }
    } else {
        echo 'Por favor, preencha todos os campos do formulário.';
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
</head>

<body>
    <h1>Cadastro</h1>

    <form action="" method="POST">
        <label for="email">Email:</label>
        <input type="email" name="email" required>

        <label for="password">Senha:</label>
        <input type="password" name="password" required>

        <button type="submit">Cadastrar</button>
    </form>

    <a href="login.php">Login</a>
    <a href="senha.php">Redefinir senha</a>
</body>

</html>