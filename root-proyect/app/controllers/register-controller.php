<?php

// session_start();

// header('Content-Type: application/json; charset=utf-8');

// //1º Recibir datos
// $input = file_get_contents('php://input');
// $data = json_decode($input,true);

// $fullname = $data['fullname'] ?? '';
// $username = $data['username'] ?? '';
// $email = $data['email'] ?? '';
// $rol = $data['rol'] ?? '';
// $password = $data['password'] ?? '';

// if(empty($fullname) || empty($username) || empty($email) || empty($rol) || empty($password)){
//     echo json_encode(['success' => false,'message' => 'Faltan datos obligatorios']);
//     exit;
// }

// try{
//     $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', ''); // CONEXION BASE DE DATOS//
//     $consultaIdRol = $bd->prepare('SELECT id FROM roles WHERE name = ?');
//     $consultaIdRol->execute([$rol]);
//     $datosID = $consultaIdRol->fetch();
//     $id = $datosID['id'];


//     //PASSWORD HASH
//     $password_hash =password_hash($password, PASSWORD_DEFAULT);
//     //
//     $insert = $bd->prepare('INSERT INTO users (full_name,username,email,password_hash,role_id) VALUES (?,?,?,?,?) ');
//     $insert->execute([$fullname,$username,$email,$password_hash,$id]);


//     $consulta = $bd->prepare('SELECT id FROM users WHERE username = ?');
//     $consulta->execute([$username]);
//     $datosConsulta = $consulta->fetch();
//     $idUsuario = $datosConsulta['id'];
//     if($insert->rowCount() == 1){
//         $_SESSION['user_id'] = $idUsuario;
//         $_SESSION['username'] = $username;
//         $_SESSION['rol'] = $rol;

//         echo json_encode([
//             'success' => true,
//             'message' => 'Login correcto'
//         ]);
//     }else{
//         echo json_encode([
//             'success' => false,
//             'message' => 'Error al insertar el usuario'
//         ]);
//     }
// }catch(Exception $e){
//     echo json_encode([
//         'success' => false,
//         'message' => 'Error del servidor' .$e->getMessage()
//     ]);
// }




// if (isset($_POST['registrarse'])) {
//     if (!empty($_POST['fullname']) and !empty($_POST['username']) and !empty($_POST['email']) and !empty($_POST['password']) and !empty($_POST['type'])) {
//         //DECLARACIÓN DE VARIABLES
//         $fullname = $_POST['fullname'];
//         $username = $_POST['username'];
//         $email = $_POST['email'];
//         $rol = $_POST['type'];
//         $pass = $_POST['password'];
//         $encrypted_pass = password_hash($pass, PASSWORD_DEFAULT);
//         try {
//             $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', ''); // CONEXION BASE DE DATOS//
//             $consulta_id = $bd->prepare('SELECT id FROM roles WHERE name = ?');
//             $consulta_id->execute([$rol]);

//             $datos = $consulta_id->fetch();
//             $id_rol = $datos['id'];
            
//             $insertar = $bd->prepare('INSERT INTO users (full_name,email,username,password_hash,role_id) VALUES (?,?,?,?,?)');
//             $insertar->execute([$fullname, $email, $username, $encrypted_pass, $id_rol]);



//             if ($insertar->rowCount() == 1) {
//                 $_SESSION['username'] = $username;
//                 $_SESSION['rol'] = $rol;
//                 header("Location: ../views/home.php");
//             } else {
//                 die($e->getMessage());
//             }
//         } catch (Exception $e) {
//             die($e->getMessage());
//         }
//     }
// }


?>