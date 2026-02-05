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
  case 'register':
    require __DIR__ . '/../app/views/register.php';
    break;
  case 'loginView':
    require __DIR__ . '/../app/views/login.php';
    break;
  case 'login':
    require __DIR__ . '/../app/controllers/login-controller.php';
    break;
  case 'registerUser':
    require __DIR__ . '/../app/controllers/register-controller.php';
    break;
  case 'logout':
    require __DIR__ . '/../app/controllers/logout.php';
    break;
  case 'editUser':
    break;
  case 'unsubscribe':
    require __DIR__ . '/../app/controllers/unsubscribe-controller.php';
    break;
  case 'createActivity':
    require __DIR__ . '/../app/views/create-activity.php';
    break;
  case 'create':
    require __DIR__ . '/../app/controllers/activity-controller.php';
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
  case 'seeMyActivities':
    require __DIR__ . '/../app/views/my-activities.php';
    break;
  case 'registration':
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
  case 'getMyActivities':
    require __DIR__ . '/../app/controllers/get-my-activities.php';
    break;
  case 'seeRequest':
    require __DIR__ . '/../app/views/home.php';
    break;
  case 'seeRegistrations':
    break;
  case 'seeRequestAccepted':
    break;
  case 'approveActivity':
    require __DIR__ . '/../app/controllers/approve-activity.php';
    break;
  case 'rejectActivity':
    require __DIR__ . '/../app/controllers/reject-activity.php';
    break;
  case 'getPendingActivities':
    require __DIR__ . '/../app/controllers/get-pending-activities.php';
    break;
  case 'controlPanel':
    require __DIR__ . '/../app/views/control.php';
    break;
  case 'seeBoth':
    require __DIR__ . '/../app/views/all-posts.php';
    break;
  default:
    require __DIR__ . '/../app/views/landing.php';
    break;
}

?>