<?php
class Registration {
    private $conn;
    private $table_name = 'registrations';

    public $id;
    public $activity_id;
    public $participant_id;
    public $registration_date;

    public function __construct($db){
        $this->conn = $db;
    }

    // Obtener todas las inscripciones
    public function getRegistrations(){
        $sql = "SELECT r.*, u.full_name AS participant_name, a.title AS activity_title
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                JOIN activities a ON r.activity_id = a.id
                ORDER BY r.registration_date DESC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    // Obtener inscripción por ID
    public function getRegistrationById($id){
        $sql = "SELECT r.*, u.full_name AS participant_name, a.title AS activity_title
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                JOIN activities a ON r.activity_id = a.id
                WHERE r.id = :id
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    // Crear inscripción
    public function createRegistration($activity_id, $participant_id){
        // Primero verificamos que no exista la inscripción (UNIQUE activity_id + participant_id)
        $checkSql = "SELECT id FROM {$this->table_name} WHERE activity_id = :activity_id AND participant_id = :participant_id";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['activity_id' => $activity_id, 'participant_id' => $participant_id]);
        if($stmt->rowCount() > 0){
            return false; // Ya existe
        }

        $sql = "INSERT INTO {$this->table_name} (activity_id, participant_id) VALUES (:activity_id, :participant_id)";
        $stmt = $this->conn->prepare($sql);
        if($stmt->execute(['activity_id' => $activity_id, 'participant_id' => $participant_id])){
            // current_registrations se actualiza automáticamente gracias al trigger
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Eliminar inscripción
    public function deleteRegistration($id){
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
        // current_registrations se decrementa automáticamente por trigger
    }
}
?>
