<?php
/**
 * Clase Registration
 * Gestiona las inscripciones de participantes a actividades.
 */
class Registration
{
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
    public function __construct($db)
    {
        $this->conn = $db;
    }

    /* =========================
       FUNCIONES PÚBLICAS
       ========================= */

    /**
     * Obtener todas las inscripciones
     * @return array Lista de inscripciones con nombre del participante y título de la actividad
     */
    public function getRegistrations()
    {
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
    public function getRegistrationById($id)
    {
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
    public function createRegistration($activity_id, $participant_id)
    {
        try {
            // Verificar si ya está inscrito
            $checkSql = "SELECT id 
                     FROM {$this->table_name} 
                     WHERE activity_id = :activity_id 
                     AND participant_id = :participant_id";

            $stmt = $this->conn->prepare($checkSql);
            $stmt->execute([
                'activity_id' => $activity_id,
                'participant_id' => $participant_id
            ]);

            if ($stmt->rowCount() > 0) {
                return ['error' => 'already_registered'];
            }

            // Obtener datos de la actividad (incluyendo la fecha)
            $activitySql = "SELECT max_people, is_completed, date 
                        FROM activities 
                        WHERE id = :activity_id";

            $stmt = $this->conn->prepare($activitySql);
            $stmt->execute(['activity_id' => $activity_id]);
            $activity = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$activity) {
                return ['error' => 'activity_not_found'];
            }

            if ($activity['is_completed'] == 1) {
                return ['error' => 'activity_completed'];
            }

            // Comprobar si el participante ya tiene otra inscripción en la misma fecha
            $conflictActivitySql = "SELECT a.title 
                                FROM {$this->table_name} r
                                JOIN activities a ON a.id = r.activity_id
                                WHERE r.participant_id = :participant_id
                                AND a.date = :date
                                AND r.activity_id != :activity_id
                                LIMIT 1";

            $stmt = $this->conn->prepare($conflictActivitySql);
            $stmt->execute([
                'participant_id' => $participant_id,
                'date' => $activity['date'],
                'activity_id' => $activity_id
            ]);
            $conflictActivity = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictActivity) {
                return ['error' => 'conflict_activity', 'title' => $conflictActivity['title']];
            }

            // Comprobar si el participante tiene alguna request en la misma fecha
            $conflictRequestSql = "SELECT title 
                               FROM requests 
                               WHERE participant_id = :participant_id
                               AND date = :date
                               AND state NOT IN ('finalizada', 'rechazada')
                               AND is_accepted = 0
                               LIMIT 1";

            $stmt = $this->conn->prepare($conflictRequestSql);
            $stmt->execute([
                'participant_id' => $participant_id,
                'date' => $activity['date']
            ]);
            $conflictRequest = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictRequest) {
                return ['error' => 'conflict_request', 'title' => $conflictRequest['title']];
            }

            // Contar inscripciones actuales
            $countSql = "SELECT COUNT(*) as total 
                     FROM {$this->table_name} 
                     WHERE activity_id = :activity_id";

            $stmt = $this->conn->prepare($countSql);
            $stmt->execute(['activity_id' => $activity_id]);
            $registrations = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Evitar overbooking (si max_people es NULL, la capacidad es ilimitada)
            if ($activity['max_people'] !== null && $registrations >= $activity['max_people']) {
                return ['error' => 'activity_full'];
            }

            // Insertar inscripción
            $insertSql = "INSERT INTO {$this->table_name} (activity_id, participant_id) 
                      VALUES (:activity_id, :participant_id)";

            $stmt = $this->conn->prepare($insertSql);
            $stmt->execute([
                'activity_id' => $activity_id,
                'participant_id' => $participant_id
            ]);

            $newId = $this->conn->lastInsertId();

            // Volver a contar inscripciones
            $stmt = $this->conn->prepare($countSql);
            $stmt->execute(['activity_id' => $activity_id]);
            $registrations = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Si se llena la actividad → marcar completada
            if ($activity['max_people'] !== null && $registrations >= $activity['max_people']) {
                $updateSql = "UPDATE activities 
                          SET is_completed = 1 
                          WHERE id = :activity_id";

                $stmt = $this->conn->prepare($updateSql);
                $stmt->execute(['activity_id' => $activity_id]);
            }

            return $newId;

        } catch (Exception $e) {
            return ['error' => 'exception', 'message' => $e->getMessage()];
        }
    }
    /**
     * Eliminar una inscripción
     * @param int $id ID de la inscripción a eliminar
     * @return bool True si se elimina correctamente, false si falla
     */
    public function deleteRegistration($id)
    {
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        // current_registrations se decrementa automáticamente por trigger
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Obtener la inscripción por ID de actividad y ID de participante
     * @param int $activity_id ID de la actividad
     * @param int $participant_id ID del participante
     * @return array|false Datos de la inscripción o false si no existe
     */
    public function getRegistrationByActivityAndParticipant($activity_id, $participant_id)
    {
        $sql = "SELECT * 
            FROM {$this->table_name} 
            WHERE activity_id = :activity_id 
              AND participant_id = :participant_id
            LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'activity_id' => $activity_id,
            'participant_id' => $participant_id
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>