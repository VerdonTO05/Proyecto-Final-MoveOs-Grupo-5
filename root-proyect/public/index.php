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

// Caso especial toggleUser
if ($action === 'toggleUser') {
  $_GET['action'] = 'toggle';
  require __DIR__ . '/../app/controllers/get/get-users-controller.php';
  exit;
}

// Resolver ruta
if (isset($routes[$action])) {
    $file = $routes[$action];
    
    // Si empieza con '/', es una URL directa → redirigir
    if (str_starts_with($file, '/')) {
        header('Location: ' . $file);
        exit;
    }
    
    require $file;
} else {
  require __DIR__ . '/../app/views/see/landing.php';
}