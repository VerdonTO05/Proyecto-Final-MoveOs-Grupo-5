<?php

return [
  'register' => __DIR__ . '/../app/views/access/register.php',
  'loginView' => __DIR__ . '/../app/views/access/login.php',
  'login' => __DIR__ . '/../app/controllers/access/login-controller.php',
  'registerUser' => __DIR__ . '/../app/controllers/access/register-controller.php',
  'logout' => __DIR__ . '/../app/controllers/access/logout.php',
  'inactiveUser' => __DIR__ . '/../app/views/user/inactive-user.php',

  'editUser' => __DIR__ . '/../app/controllers/user/edit-info-controller.php',
  'viewInfo' => __DIR__ . '/../app/controllers/user/see-info-controller.php',

  'unsubscribe' => __DIR__ . '/../app/controllers/access/unsubscribe-controller.php',

  'createActivity' => __DIR__ . '/../app/views/posts/create-activity.php',
  'create' => __DIR__ . '/../app/controllers/posts/activity-controller.php',

  'editActivity' => __DIR__ . '/../app/controllers/posts/edit-activity-controller.php',
  'deleteActivity' => __DIR__ . '/../app/controllers/posts/delete-activity-controller.php',

  'seeMyActivities' => __DIR__ . '/../app/views/see/my-activities.php',
  'seeActivities' => __DIR__ . '/../app/views/see/home.php',
  'seeRequest' => __DIR__ . '/../app/views/see/home.php',
  'seeRegistrations' => __DIR__ . '/../app/views/see/my-registrations.php',

  'acceptRequest' => __DIR__ . '/../app/controllers/posts/accept-request-controller.php',
  'signupActivity' => __DIR__ . '/../app/controllers/posts/signup-activity-controller.php',

  'getActivities' => __DIR__ . '/../app/controllers/get/get-activities.php',
  'getRequests' => __DIR__ . '/../app/controllers/get/get-requests.php',
  'getMyActivities' => __DIR__ . '/../app/controllers/get/get-my-activities.php',
  'inscripciones' => __DIR__ . '/../app/controllers/get/get-my-registrations.php',

  'getAprove' => __DIR__ . '/../app/controllers/get/get-aprove.php',
  'getPendingActivities' => __DIR__ . '/../app/controllers/get/get-pending-activities.php',

  'approveActivity' => __DIR__ . '/../app/controllers/control/approve-activity.php',
  'rejectActivity' => __DIR__ . '/../app/controllers/control/reject-activity.php',

  'controlPanel' => __DIR__ . '/../app/views/control/control.php',
  'seeBoth' => __DIR__ . '/../app/views/control/all-posts.php',
  'users' => __DIR__ . '/../app/views/control/users.php',

  'getUsers' => __DIR__ . '/../app/controllers/get/get-users-controller.php',
  'toggleUser' => __DIR__ . '/../app/controllers/get/get-users-controller.php',
  'notifyUser' => __DIR__ . '/../app/controllers/get/get-users-controller.php',

  'forgot-password' => __DIR__ . '/../app/views/user/forgot-password.php',
  'changePassword' => __DIR__ . '/../app/controllers/user/forgot-password-controller.php',
  'requestCode' => __DIR__ . '/../app/controllers/user/request-code-controller.php',

  'uploadAvatar' => __DIR__ . '/../app/controllers/user/upload-avatar-controller.php',
  'cancelRegistration' => __DIR__ . '/../app/controllers/posts/cancel-registration-controller.php',

  'chatHub' => __DIR__ . '/../app/views/chat/chat-hub.php',
  'getChatHub' => __DIR__ . '/../app/controllers/chat/get-chat-hub.php',
  'getMessages' => __DIR__ . '/../app/controllers/chat/get-messages.php',
  'sendMessage' => __DIR__ . '/../app/controllers/chat/send-message.php',
  'getChatRooms' => __DIR__ . '/../app/controllers/chat/get-chat-rooms.php',
  'chatActivity' => __DIR__ . '/../app/views/chat/chat-activity.php',
  'adminChat' => __DIR__ . '/../app/views/chat/admin-chat.php',
  'userAdminChat' => __DIR__ . '/../app/views/chat/user-admin-chat.php',

  'docsJS' => dirname($_SERVER['SCRIPT_NAME']) . '/docsJS/index.html',
  'docsPHP' => dirname($_SERVER['SCRIPT_NAME']) . '/docsPHP/index.html',
  'activitiesSSE' => __DIR__ . '/../app/controllers/get/get-activities-sse.php',

];