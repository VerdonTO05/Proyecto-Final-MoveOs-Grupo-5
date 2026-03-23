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
    require __DIR__ . '/../app/views/access/register.php';
    break;
  case 'loginView':
    require __DIR__ . '/../app/views/access/login.php';
    break;
  case 'login':
    require __DIR__ . '/../app/controllers/access/login-controller.php';
    break;
  case 'registerUser':
    require __DIR__ . '/../app/controllers/access/register-controller.php';
    break;
  case 'logout':
    require __DIR__ . '/../app/controllers/access/logout.php';
    break;
  case 'editUser':
    require __DIR__ . '/../app/controllers/user/edit-info-controller.php';
    break;
  case 'viewInfo':
    require __DIR__ . '/../app/controllers/user/see-info-controller.php';
    break;
  case 'unsubscribe':
    require __DIR__ . '/../app/controllers/access/unsubscribe-controller.php';
    break;
  case 'createActivity':
    require __DIR__ . '/../app/views/posts/create-activity.php';
    break;
  case 'create':
    require __DIR__ . '/../app/controllers/posts/activity-controller.php';
    break;
  case 'editActivity':
    require __DIR__ . '/../app/controllers/posts/edit-activity-controller.php';
    break;
  case 'deleteActivity':
    require __DIR__ . '/../app/controllers/posts/delete-activity-controller.php';
    break;
  case 'seeMyActivities':
    require __DIR__ . '/../app/views/see/my-activities.php';
    break;
  case 'acceptRequest':
    require __DIR__ . '/../app/controllers/posts/accept-request-controller.php';
    // Aceptar petición
    break;
  case 'signupActivity':
    require __DIR__ . '/../app/controllers/posts/signup-activity-controller.php';
    // Inscribirse
    break;
  case 'seeActivities':
    require __DIR__ . '/../app/views/see/home.php';
    break;
  case 'getAprove':
    require __DIR__ . '/../app/controllers/get/get-aprove.php';
    break;
  case 'getActivities':
    require __DIR__ . '/../app/controllers/get/get-activities.php';
    break;
  case 'getRequests':
    require __DIR__ . '/../app/controllers/get/get-requests.php';
    break;
  case 'getMyActivities':
    require __DIR__ . '/../app/controllers/get/get-my-activities.php';
    break;
  case 'inscripciones':
    require __DIR__ . '/../app/controllers/get/get-my-registrations.php';
    break;
  case 'seeRequest':
    require __DIR__ . '/../app/views/see/home.php';
    break;
  case 'seeRegistrations':
    require __DIR__ . '/../app/views/see/my-registrations.php';
    break;
  case 'approveActivity':
    require __DIR__ . '/../app/controllers/control/approve-activity.php';
    break;
  case 'rejectActivity':
    require __DIR__ . '/../app/controllers/control/reject-activity.php';
    break;
  case 'getPendingActivities':
    require __DIR__ . '/../app/controllers/get/get-pending-activities.php';
    break;
  case 'controlPanel':
    require __DIR__ . '/../app/views/control/control.php';
    break;
  case 'seeBoth':
    require __DIR__ . '/../app/views/control/all-posts.php';
    break;
  case 'users':
    require __DIR__ . '/../app/views/control/users.php';
    break;
  case 'inactiveUser':
    require __DIR__ . '/../app/views/user/inactive-user.php';
    break;
  case 'getUsers':
    require __DIR__ . '/../app/controllers/get/get-users-controller.php';
    break;
  case 'toggleUser':
    $_GET['action'] = 'toggle'; // redirige internamente al controlador unificado
    require __DIR__ . '/../app/controllers/get/get-users-controller.php';
    break;
  case 'forgot-password':
    require __DIR__ . '/../app/views/user/forgot-password.php';
    break;
  case 'changePassword':
    require __DIR__ . '/../app/controllers/user/forgot-password-controller.php';
    break;
  case 'requestCode':
    require __DIR__ . '/../app/controllers/user/request-code-controller.php';
    break;
  case 'uploadAvatar':
    require __DIR__ . '/../app/controllers/user/upload-avatar-controller.php';
    break;
  case 'cancelRegistration':
    require __DIR__ . '/../app/controllers/posts/cancel-registration-controller.php';
    break;
  // ── Chat ────────────────────────────────────────────────────────────────
  case 'chatHub':
    require __DIR__ . '/../app/views/chat/chat-hub.php';
    break;
  case 'getChatHub':
    require __DIR__ . '/../app/controllers/chat/get-chat-hub.php';
    exit;
  case 'getMessages':
    require __DIR__ . '/../app/controllers/chat/get-messages.php';
    break;
  case 'sendMessage':
    require __DIR__ . '/../app/controllers/chat/send-message.php';
    break;
  case 'getChatRooms':
    require __DIR__ . '/../app/controllers/chat/get-chat-rooms.php';
    break;
  case 'chatActivity':
    require __DIR__ . '/../app/views/chat/chat-activity.php';
    break;
  case 'adminChat':
    require __DIR__ . '/../app/views/chat/admin-chat.php';
    break;
  case 'userAdminChat':
    require __DIR__ . '/../app/views/chat/user-admin-chat.php';
    break;
  // ────────────────────────────────────────────────────────────────────────


  default:
    require __DIR__ . '/../app/views/see/landing.php';
    break;
}

?>