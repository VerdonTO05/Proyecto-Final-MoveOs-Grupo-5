<?php

session_start();

if (isset($_POST['registrarse'])) {
    if (!empty($_POST['fullname']) and !empty($_POST['username']) and !empty($_POST['email']) and !empty($_POST['password']) and !empty($_POST['type'])) {
        //DECLARACIÓN DE VARIABLES
        $fullname = $_POST['fullname'];
        $username = $_POST['username'];
        $email = $_POST['email'];
        $rol = $_POST['type'];
        $pass = $_POST['password'];
        $encrypted_pass = password_hash($pass, PASSWORD_DEFAULT);
        try {
            $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', ''); // CONEXION BASE DE DATOS//
            $consulta_id = $bd->prepare('SELECT id FROM roles WHERE name = ?');
            $consulta_id->execute([$rol]);

            $datos = $consulta_id->fetch();
            $id_rol = $datos['id'];
            
            $insertar = $bd->prepare('INSERT INTO users (full_name,email,username,password_hash,role_id) VALUES (?,?,?,?,?)');
            $insertar->execute([$fullname, $email, $username, $encrypted_pass, $id_rol]);



            if ($insertar->rowCount() == 1) {
                $_SESSION['username'] = $username;
                $_SESSION['rol'] = $rol;
                header("Location: ../views/home.php");
            } else {
                die($e->getMessage());
            }
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }
}


?>