<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

if (isset($_SESSION['error'])) {
  echo "<script>alert('{$_SESSION['error']}');</script>";
  unset($_SESSION['error']); // eliminar mensaje después de mostrarlo
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
    require __DIR__ . '/../app/controllers/edit-info-controller.php';
    break;
  case 'viewInfo':
    require __DIR__ . '/../app/controllers/see-info-controller.php';
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
    require __DIR__ . '/../app/controllers/edit-activity-controller.php';
    break;
  case 'deleteActivity':
    require __DIR__ . '/../app/controllers/delete-activity-controller.php';
    break;
  case 'seeMyActivities':
    require __DIR__ . '/../app/views/my-activities.php';
    break;
  case 'acceptRequest':
    require __DIR__ . '/../app/controllers/accept-request-controller.php';
    // Aceptar petición
    break;
  case 'signupActivity':
    require __DIR__ . '/../app/controllers/signup-activity-controller.php';
    // Inscribirse
    break;
  case 'seeActivities':
    require __DIR__ . '/../app/views/home.php';
    break;
  case 'getAprove':
    require __DIR__ . '/../app/controllers/get-aprove.php';
    break;
  case 'getActivities':
    require __DIR__ . '/../app/controllers/get-activities.php';
    break;
  case 'getRequests':
    require __DIR__ . '/../app/controllers/get-requests.php';
    break;
  case 'getMyActivities':
    require __DIR__ . '/../app/controllers/get-my-activities.php';
    break;
  case 'inscripciones':
    require __DIR__ . '/../app/controllers/get-my-registrations.php';
    break;
  case 'seeRequest':
    require __DIR__ . '/../app/views/home.php';
    break;
  case 'seeRegistrations':
    require __DIR__ . '/../app/views/my-registrations.php';
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
  case 'users':
    require __DIR__ . '/../app/views/users.php';
    break;
  case 'inactiveUser':
    require __DIR__ . '/../app/views/inactive-user.php';
    break;
  case 'getUsers':
    require __DIR__ . '/../app/controllers/get-users-controller.php';
    break;
  case 'toggleUser':
    $_GET['action'] = 'toggle'; // redirige internamente al controlador unificado
    require __DIR__ . '/../app/controllers/get-users-controller.php';
    break;
  case 'forgot-password':
    require __DIR__ . '/../app/views/forgot-password.php';
    break;
  case 'changePassword':
    require __DIR__ . '/../app/controllers/forgot-password-controller.php';
    break;
  case 'requestCode':
    require __DIR__ . '/../app/controllers/request-code-controller.php';
    break;

  // ── Chat ────────────────────────────────────────────────────────────────
  case 'chatHub':
    require __DIR__ . '/../app/views/chat-hub.php';
    break;
  case 'getChatHub':
    require __DIR__ . '/../app/controllers/get-chat-hub.php';
    exit;
  case 'getMessages':
    require __DIR__ . '/../app/controllers/get-messages.php';
    break;
  case 'sendMessage':
    require __DIR__ . '/../app/controllers/send-message.php';
    break;
  case 'getChatRooms':
    require __DIR__ . '/../app/controllers/get-chat-rooms.php';
    break;
  case 'chatActivity':
    require __DIR__ . '/../app/views/chat-activity.php';
    break;
  case 'adminChat':
    require __DIR__ . '/../app/views/admin-chat.php';
    break;
  case 'userAdminChat':
    require __DIR__ . '/../app/views/user-admin-chat.php';
    break;
  // ────────────────────────────────────────────────────────────────────────


  default:
    require __DIR__ . '/../app/views/landing.php';
    break;
}

?>