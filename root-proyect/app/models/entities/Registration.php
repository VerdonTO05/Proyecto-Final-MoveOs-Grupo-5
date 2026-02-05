<?php
/**
 * Clase Registration
 * Gestiona las inscripciones de participantes a actividades.
 */
class Registration {
    /**
     * Conexión a la base de datos (PDO)
     * @var PDO
     */
    private $conn;

    /**
     * Nombre de la tabla en la base de datos
     * @var string
     */
    private $table_name = 'registrations';

    /**
     * ID de la inscripción
     * @var int
     */
    public $id;

    /**
     * ID de la actividad asociada
     * @var int
     */
    public $activity_id;

    /**
     * ID del participante asociado
     * @var int
     */
    public $participant_id;

    /**
     * Fecha de la inscripción
     * @var string
     */
    public $registration_date;

    /**
     * Constructor de la clase
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db){
        $this->conn = $db;
    }

    /* =========================
       FUNCIONES PÚBLICAS
       ========================= */

    /**
     * Obtener todas las inscripciones
     * @return array Lista de inscripciones con nombre del participante y título de la actividad
     */
    public function getRegistrations(){
        $sql = "SELECT r.*, u.full_name AS participant_name, a.title AS activity_title
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                JOIN activities a ON r.activity_id = a.id
                ORDER BY r.registration_date DESC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener una inscripción por su ID
     * @param int $id ID de la inscripción
     * @return array|false Datos de la inscripción o false si no existe
     */
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

    /**
     * Crear una nueva inscripción
     * @param int $activity_id ID de la actividad
     * @param int $participant_id ID del participante
     * @return mixed ID de la inscripción creada o false si ya existe o falla
     */
    public function createRegistration($activity_id, $participant_id){
        // Verificar si ya existe la inscripción (actividad + participante)
        $checkSql = "SELECT id FROM {$this->table_name} 
                     WHERE activity_id = :activity_id AND participant_id = :participant_id";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['activity_id' => $activity_id, 'participant_id' => $participant_id]);

        if($stmt->rowCount() > 0){
            return false; // Ya existe la inscripción
        }

        // Crear inscripción
        $sql = "INSERT INTO {$this->table_name} (activity_id, participant_id) 
                VALUES (:activity_id, :participant_id)";
        $stmt = $this->conn->prepare($sql);

        if($stmt->execute(['activity_id' => $activity_id, 'participant_id' => $participant_id])){
            // current_registrations se actualiza automáticamente gracias a un trigger en la BD
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Eliminar una inscripción
     * @param int $id ID de la inscripción a eliminar
     * @return bool True si se elimina correctamente, false si falla
     */
    public function deleteRegistration($id){
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        // current_registrations se decrementa automáticamente por trigger
        return $stmt->execute(['id' => $id]);
    }
}
?>
