<?php

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

if (isset($_SESSION['error'])) {
  echo "<script>alert('{$_SESSION['error']}');</script>";
  unset($_SESSION['error']);
}

// Cargar rutas
$routes = require __DIR__ . '/../config/routes.php';

// Leer input JSON
$input = [];
if (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
  $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

// Obtener acción
$action = $input['accion'] ?? $_POST['accion'] ?? $_GET['accion'] ?? 'default';

// Redirigir a la documentación de JSDoc
if ($action === 'docs') {
    header('Location: /MOVEOS_23_03/root-proyect/public/docs/index.html');
    exit;
}

// Caso especial (comprobación extra)
if ($action === 'toggleUser') {
    $_GET['action'] = 'toggle';
    require __DIR__ . '/../app/controllers/get/get-users-controller.php';
    exit;
}

// Resolver ruta
if (isset($routes[$action])) {
    require $routes[$action];
} else {
    require __DIR__ . '/../app/views/see/landing.php';
}