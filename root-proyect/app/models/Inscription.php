<?php
class Inscription {

  public function createInscription($userId, $activityId) {
    $db = Database::connect();

    // 1. ¿Ya está inscrito?
    $stmt = $db->prepare(
      "SELECT id FROM inscriptions WHERE user_id = ? AND activity_id = ?"
    );
    $stmt->execute([$userId, $activityId]);

    if ($stmt->rowCount() > 0) {
      return "Ya estás inscrito en esta actividad";
    }

    // 2. Insertar inscripción
    $stmt = $db->prepare(
      "INSERT INTO inscriptions (user_id, activity_id) VALUES (?, ?)"
    );

    return $stmt->execute([$userId, $activityId]);
  }
}
