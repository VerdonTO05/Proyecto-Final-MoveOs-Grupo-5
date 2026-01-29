<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}


// Leer JSON si viene por fetch
$input = [];
if (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
  $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

// Acción por JSON, POST o GET
$action = $input['accion'] ?? $_POST['accion'] ?? $_GET['accion'] ?? 'index';


switch ($action) {
  case 'index':
    require __DIR__ . '/../app/views/landing.php';
    break;
  case 'register':
    require __DIR__ . '/../app/views/register.php';
    break;
  case 'loginView':
    require __DIR__ . '/../app/views/login.php';
    break;
  case 'login':
    require __DIR__ . '/../app/controllers/login-controller.php';
    break;
  case 'logout':
    break;
  case 'editUser':
    break;
  case 'createActivity':
    require __DIR__ . '/../app/views/create-activity.php';
    break;
  case 'editActivity':
    break;
  case 'deleteActivity':
    break;
  case 'createRequest':
    break;
  case 'editRequest':
    break;
  case 'deleteRequest':
    break;
  case 'registration':
    break;
  case 'unsubscribe':
    break;
  case 'accept':
    break;
  case 'deny':
    break;
  case 'seeActivities':
    require __DIR__ . '/../app/views/home.php';
    break;
  case 'getActivities':
    require __DIR__ . '/../app/controllers/get-activities.php';
    break;
  case 'seeRequest':
    require __DIR__ . '/../app/views/home.php';
    break;
  case 'seeRegistrations':
    break;
  case 'seeRequestAccepted':
    break;
}

?>