<?php
/**
 * Clase Request
 * Gestiona las peticiones de actividades creadas por los participantes.
 */
class Request
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
    private $table_name = 'requests';

    /**
     * Propiedades de la petición
     */
    public $id;
    public $participant_id;
    public $category_id;
    public $title;
    public $description;
    public $date;
    public $time;
    public $location;
    public $current_registrations;
    public $organizer_email;
    public $transport_included;
    public $departure_city;
    public $language;
    public $min_age;
    public $pets_allowed;
    public $dress_code;
    public $is_accepted;
    public $accepted_by;
    public $created_at;
    public $state;

    /**
     * Constructor
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
     * Obtener todas las peticiones
     * @return array Lista de peticiones con información del participante, quien aceptó y categoría
     */
    public function getRequests()
    {
        $sql = "SELECT r.*, u.full_name AS participant_name, ru.full_name AS accepted_by_name, c.name AS category_name
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                LEFT JOIN users ru ON r.accepted_by = ru.id   -- accepted_by puede ser NULL
                JOIN categories c ON r.category_id = c.id
                WHERE r.date >= CURDATE()
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Obtener una petición por su ID
     * @param int $id ID de la petición
     * @return array|false Datos de la petición o false si no existe
     */
    public function getRequestById($id)
    {
        $sql = "SELECT r.*, u.full_name AS participant_name, ru.full_name AS accepted_by_name, c.name AS category_name
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                LEFT JOIN users ru ON r.accepted_by = ru.id   -- accepted_by puede ser NULL
                JOIN categories c ON r.category_id = c.id
                WHERE r.id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Obtener todas las peticiones activas de un participante específico
     * @param int $participantId ID del participante
     * @return array Lista de peticiones
     */
    public function getRequestsByParticipantId($participantId)
    {
        $sql = "SELECT r.*, u.full_name AS participant_name, c.name AS category_name
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                JOIN categories c ON r.category_id = c.id
                WHERE r.participant_id = :participant_id
                AND r.date >= CURDATE()
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['participant_id' => $participantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener todas las peticiones finalizadas de un participante específico
     * @param int $participantId ID del participante
     * @return array Lista de peticiones finalizadas
     */
    public function getRequestsFinishedByParticipantId($participantId)
    {
        $sql = "SELECT r.*, u.full_name AS participant_name, c.name AS category_name
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                JOIN categories c ON r.category_id = c.id
                WHERE r.participant_id = :participant_id
                AND r.date < CURDATE()
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['participant_id' => $participantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Crear una nueva petición
     * @param array $data Datos de la petición
     * @return mixed ID de la petición creada, o array con 'error' si falla
     */
    public function createRequest($data)
    {
        try {
            $date           = $data['date']           ?? null;
            $participant_id = $data['participant_id'] ?? null;

            // Comprobar si el participante ya tiene otra petición en esa fecha
            $conflictRequestSql = "SELECT title FROM {$this->table_name}
                                   WHERE participant_id = :participant_id
                                   AND date = :date
                                   AND state != 'finalizada'
                                   LIMIT 1";
            $stmt = $this->conn->prepare($conflictRequestSql);
            $stmt->execute(['participant_id' => $participant_id, 'date' => $date]);
            $conflictRequest = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictRequest) {
                return ['error' => 'conflict_request', 'title' => $conflictRequest['title']];
            }

            // Comprobar si el participante tiene una inscripción en una actividad en esa fecha
            $conflictActivitySql = "SELECT a.title
                                    FROM registrations r
                                    JOIN activities a ON a.id = r.activity_id
                                    WHERE r.participant_id = :participant_id
                                    AND a.date = :date
                                    AND a.is_finished = 0
                                    LIMIT 1";
            $stmt = $this->conn->prepare($conflictActivitySql);
            $stmt->execute(['participant_id' => $participant_id, 'date' => $date]);
            $conflictActivity = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictActivity) {
                return ['error' => 'conflict_activity', 'title' => $conflictActivity['title']];
            }

            // Insertar la petición
            $sql = "INSERT INTO {$this->table_name} 
                (participant_id, category_id, title, description, date, time, location, current_registrations, organizer_email,
                 transport_included, departure_city, language, min_age, pets_allowed, dress_code, image_url, state)
                VALUES 
                (:participant_id, :category_id, :title, :description, :date, :time, :location, :current_registrations, :organizer_email,
                 :transport_included, :departure_city, :language, :min_age, :pets_allowed, :dress_code, :image_url, :state)";

            $stmt = $this->conn->prepare($sql);

            if ($stmt->execute($data)) {
                return $this->conn->lastInsertId();
            }

            return ['error' => 'insert_failed'];

        } catch (PDOException $e) {
            error_log("Error en createRequest: " . $e->getMessage());
            return ['error' => 'exception', 'message' => $e->getMessage()];
        }
    }

    /**
     * Editar una petición existente
     * @param array $data Datos a actualizar (debe incluir 'id')
     * @return bool|array true si se actualiza, array con 'error' si falla
     */
    public function updateRequest($data): bool|array
    {
        try {
            $id             = $data['id']             ?? null;
            $date           = $data['date']           ?? null;
            $participant_id = $data['participant_id'] ?? null;

            // Comprobar si el participante tiene otra petición propia en esa fecha (excluyendo la actual)
            $conflictRequestSql = "SELECT title FROM {$this->table_name}
                                   WHERE participant_id = :participant_id
                                   AND date = :date
                                   AND id != :id
                                   AND state != 'finalizada'
                                   LIMIT 1";
            $stmt = $this->conn->prepare($conflictRequestSql);
            $stmt->execute(['participant_id' => $participant_id, 'date' => $date, 'id' => $id]);
            $conflictRequest = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictRequest) {
                return ['error' => 'conflict_request', 'title' => $conflictRequest['title']];
            }

            // Comprobar si el participante tiene una inscripción en una actividad en esa fecha
            $conflictActivitySql = "SELECT a.title
                                    FROM registrations r
                                    JOIN activities a ON a.id = r.activity_id
                                    WHERE r.participant_id = :participant_id
                                    AND a.date = :date
                                    AND a.is_finished = 0
                                    LIMIT 1";
            $stmt = $this->conn->prepare($conflictActivitySql);
            $stmt->execute(['participant_id' => $participant_id, 'date' => $date]);
            $conflictActivity = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictActivity) {
                return ['error' => 'conflict_activity', 'title' => $conflictActivity['title']];
            }

            // Quitar participant_id antes de la query de actualización
            $queryData = $data;
            unset($queryData['participant_id']);

            $sql = "UPDATE {$this->table_name} SET
                title              = :title,
                description        = :description,
                category_id        = :category_id,
                location           = :location,
                date               = :date,
                time               = :time,
                language           = :language,
                min_age            = :min_age,
                dress_code         = :dress_code,
                transport_included = :transport_included,
                departure_city     = :departure_city,
                pets_allowed       = :pets_allowed
            WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($queryData);

            if ($stmt->rowCount() === 0) {
                return ['error' => 'not_found'];
            }

            return true;

        } catch (PDOException $e) {
            error_log("Error en updateRequest: " . $e->getMessage());
            return ['error' => 'exception', 'message' => $e->getMessage()];
        }
    }

    /**
     * Eliminar una petición
     * @param int $id ID de la petición a eliminar
     * @return bool True si se elimina correctamente, false si falla
     */
    public function deleteRequest($id)
    {
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Obtener peticiones por estado
     * @param string $state Estado de las peticiones (ej: 'pendiente', 'aceptada')
     * @return array Lista de peticiones
     */
    public function getRequestsByState($state)
    {
        $sql = "SELECT r.*, u.full_name AS participant_name, c.name AS category_name
                FROM {$this->table_name} r
                JOIN users u ON r.participant_id = u.id
                JOIN categories c ON r.category_id = c.id
                WHERE r.state = :state AND r.is_accepted = 0
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['state' => $state]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Actualizar el estado de una petición
     * @param int $id ID de la petición
     * @param string $newState Nuevo estado (ej: 'aceptada', 'rechazada')
     * @return bool True si se actualizó correctamente, false si falla
     */
    public function updateState($id, $newState)
    {
        $sql = "UPDATE {$this->table_name} SET state = :state WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id, 'state' => $newState]);
    }

    /**
     * Obtener estadísticas de las peticiones
     * @return array Contiene total, pendiente, aprobada, rechazada
     */
    public function getStats()
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(CASE WHEN state = 'pendiente' THEN 1 ELSE 0 END), 0) as pendiente,
                    COALESCE(SUM(CASE WHEN state = 'aprobada'  THEN 1 ELSE 0 END), 0) as aprobada,
                    COALESCE(SUM(CASE WHEN state = 'rechazada' THEN 1 ELSE 0 END), 0) as rechazada
                FROM {$this->table_name}";

        $stmt = $this->conn->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Aceptar una petición por parte de un organizador
     * @param int $request_id ID de la petición
     * @param int $organizer_id ID del organizador que acepta
     * @return bool|array true si se acepta, array con 'error' si hay conflicto o falla
     */
    public function acceptRequest($request_id, $organizer_id)
    {
        try {
            // Obtener la fecha de la request
            $dateSql = "SELECT date FROM {$this->table_name}
                        WHERE id = :request_id AND is_accepted = 0";
            $stmt = $this->conn->prepare($dateSql);
            $stmt->execute(['request_id' => $request_id]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$request) {
                return ['error' => 'request_not_found'];
            }

            $date = $request['date'];

            // Comprobar si el organizador ya aceptó otra request en esa fecha
            $conflictRequestSql = "SELECT title FROM {$this->table_name}
                                   WHERE accepted_by = :organizer_id
                                   AND date = :date
                                   AND is_accepted = 1
                                   LIMIT 1";
            $stmt = $this->conn->prepare($conflictRequestSql);
            $stmt->execute(['organizer_id' => $organizer_id, 'date' => $date]);
            $conflictRequest = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictRequest) {
                return ['error' => 'conflict_request', 'title' => $conflictRequest['title']];
            }

            // Comprobar si el organizador tiene actividades propias en esa fecha
            $conflictActivitySql = "SELECT title FROM activities
                                    WHERE offertant_id = :organizer_id
                                    AND date = :date
                                    AND is_finished = 0
                                    LIMIT 1";
            $stmt = $this->conn->prepare($conflictActivitySql);
            $stmt->execute(['organizer_id' => $organizer_id, 'date' => $date]);
            $conflictActivity = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conflictActivity) {
                return ['error' => 'conflict_activity', 'title' => $conflictActivity['title']];
            }

            // Aceptar la request
            $sql = "UPDATE {$this->table_name}
                    SET is_accepted = 1,
                        accepted_by = :organizer_id
                    WHERE id = :request_id
                    AND is_accepted = 0";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['request_id' => $request_id, 'organizer_id' => $organizer_id]);

            if ($stmt->rowCount() === 0) {
                return ['error' => 'already_accepted'];
            }

            return true;

        } catch (Exception $e) {
            return ['error' => 'exception', 'message' => $e->getMessage()];
        }
    }

    /**
     * Deshacer la aceptación de una petición
     * @param int $request_id ID de la petición
     * @param int $organizer_id ID del organizador
     * @return bool true si se deshace, false si no era suya
     */
    public function unacceptRequest($request_id, $organizer_id)
    {
        $sql = "UPDATE {$this->table_name}
                SET is_accepted = 0,
                    accepted_by = NULL
                WHERE id = :request_id
                AND accepted_by = :organizer_id";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['request_id' => $request_id, 'organizer_id' => $organizer_id]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Obtener peticiones aceptadas por un organizador según estado
     * @param int $organizer_id ID del organizador
     * @param string $state Estado de las peticiones
     * @return array Lista de peticiones
     */
    public function getAcceptedRequestsByOrganizerId($organizer_id, $state)
    {
        $sql = "SELECT r.*, c.name AS category_name
                FROM requests r
                LEFT JOIN categories c ON r.category_id = c.id
                WHERE r.accepted_by = :organizer_id
                AND r.state = :state
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['organizer_id' => $organizer_id, 'state' => $state]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener peticiones aceptadas y finalizadas por un organizador
     * @param int $organizer_id ID del organizador
     * @return array Lista de peticiones finalizadas
     */
    public function getAcceptedRequestsFinishedByOrganizerId($organizer_id)
    {
        $sql = "SELECT r.*, c.name AS category_name
                FROM requests r
                LEFT JOIN categories c ON r.category_id = c.id
                WHERE r.accepted_by = :organizer_id
                AND r.date < CURDATE()
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['organizer_id' => $organizer_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>