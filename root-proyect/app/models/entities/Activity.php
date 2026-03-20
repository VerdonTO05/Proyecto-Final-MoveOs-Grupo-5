<?php
/**
 * Clase Activity
 * Gestiona las actividades en la base de datos: creación, lectura, actualización, eliminación y estadísticas.
 */
class Activity
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
    private $table_name = 'activities';

    /**
     * Constructor de la clase
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Crear una nueva actividad
     * @param array $data Datos de la actividad en formato asociativo:
     *  - offertant_id, category_id, title, description, date, time, price, max_people,
     *    current_registrations, organizer_email, location, transport_included,
     *    departure_city, language, min_age, pets_allowed, dress_code, image_url, state
     * @return mixed Retorna el ID de la actividad creada o false si falla
     */
    public function createActivity($data)
    {
        try {
            $date         = $data['date']         ?? null;
            $offertant_id = $data['offertant_id'] ?? null;

            // Solo comprobar conflictos si hay ofertante
            if ($offertant_id) {

                // Comprobar si el ofertante tiene una petición aceptada en esa fecha
                $conflictRequestSql = "SELECT title FROM requests
                                       WHERE accepted_by = :offertant_id
                                       AND date = :date
                                       AND is_accepted = 1
                                       AND state != 'finalizada'
                                       LIMIT 1";
                $stmt = $this->conn->prepare($conflictRequestSql);
                $stmt->execute(['offertant_id' => $offertant_id, 'date' => $date]);
                $conflictRequest = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($conflictRequest) {
                    return ['error' => 'conflict_request', 'title' => $conflictRequest['title']];
                }

                // Comprobar si el ofertante ya tiene otra actividad en esa fecha
                $conflictActivitySql = "SELECT title FROM {$this->table_name}
                                        WHERE offertant_id = :offertant_id
                                        AND date = :date
                                        AND is_finished = 0
                                        LIMIT 1";
                $stmt = $this->conn->prepare($conflictActivitySql);
                $stmt->execute(['offertant_id' => $offertant_id, 'date' => $date]);
                $conflictActivity = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($conflictActivity) {
                    return ['error' => 'conflict_activity', 'title' => $conflictActivity['title']];
                }
            }

            // Insertar la actividad
            $sql = "INSERT INTO {$this->table_name} 
                (offertant_id, category_id, title, description, date, time, price, max_people, 
                 current_registrations, organizer_email, location, transport_included, 
                 departure_city, language, min_age, pets_allowed, dress_code, image_url, state)
                VALUES
                (:offertant_id, :category_id, :title, :description, :date, :time, :price, :max_people, 
                 :current_registrations, :organizer_email, :location, :transport_included, 
                 :departure_city, :language, :min_age, :pets_allowed, :dress_code, :image_url, :state)";

            $stmt = $this->conn->prepare($sql);

            if ($stmt->execute($data)) {
                return $this->conn->lastInsertId();
            }

            return ['error' => 'insert_failed'];

        } catch (PDOException $e) {
            error_log("Error en createActivity: " . $e->getMessage());
            return ['error' => 'exception', 'message' => $e->getMessage()];
        }
    }

    /**
     * Obtener todas las actividades con información del ofertante y categoría
     * @return array Lista de actividades
     */
    public function getActivities()
    {
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                LEFT JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.date >= CURDATE()
                ORDER BY a.created_at DESC";

        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener actividades filtradas por el ID del ofertante
     * @param int $offertantId ID del usuario que ofrece la actividad
     * @return array Lista de actividades de ese ofertante
     */
    public function getActivitiesByOffertantId($offertantId)
    {
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                LEFT JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.offertant_id = :offertant_id
                AND a.date >= CURDATE()
                ORDER BY a.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['offertant_id' => $offertantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener actividades finalizadas filtradas por el ID del ofertante
     * @param int $offertantId ID del usuario que ofrece la actividad
     * @return array Lista de actividades finalizadas de ese ofertante
     */
    public function getActivitiesFinishedByOffertantId($offertantId)
    {
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                LEFT JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.offertant_id = :offertant_id
                AND a.date < CURDATE()
                ORDER BY a.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['offertant_id' => $offertantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener una actividad por su ID
     * @param int $id ID de la actividad
     * @return array|false Datos de la actividad o false si no existe
     */
    public function getActivityById($id)
    {
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                LEFT JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Actualizar una actividad existente
     * @param array $data Datos a actualizar incluyendo 'id'
     * @return bool|array true si se actualiza, array con 'error' si falla
     */
    public function updateActivity($data): bool|array
    {
        try {
            $id           = $data['id']           ?? null;
            $date         = $data['date']         ?? null;
            $offertant_id = $data['offertant_id'] ?? null;

            // Solo comprobar conflictos si hay ofertante
            if ($offertant_id) {

                // Comprobar si el ofertante tiene otra actividad en esa fecha (excluyendo la actual)
                $conflictActivitySql = "SELECT title FROM activities
                                        WHERE offertant_id = :offertant_id
                                        AND date = :date
                                        AND id != :id
                                        AND is_finished = 0
                                        LIMIT 1";
                $stmt = $this->conn->prepare($conflictActivitySql);
                $stmt->execute(['offertant_id' => $offertant_id, 'date' => $date, 'id' => $id]);
                $conflictActivity = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($conflictActivity) {
                    return ['error' => 'conflict_activity', 'title' => $conflictActivity['title']];
                }

                // Comprobar si el ofertante tiene una request aceptada en esa fecha
                $conflictRequestSql = "SELECT title FROM requests
                                       WHERE accepted_by = :offertant_id
                                       AND date = :date
                                       AND is_accepted = 1
                                       AND state != 'finalizada'
                                       LIMIT 1";
                $stmt = $this->conn->prepare($conflictRequestSql);
                $stmt->execute(['offertant_id' => $offertant_id, 'date' => $date]);
                $conflictRequest = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($conflictRequest) {
                    return ['error' => 'conflict_request', 'title' => $conflictRequest['title']];
                }
            }

            // Quitar offertant_id antes de la query de actualización
            $queryData = $data;
            unset($queryData['offertant_id']);

            $sql = "UPDATE activities SET
                title              = :title,
                description        = :description,
                category_id        = :category_id,
                location           = :location,
                date               = :date,
                time               = :time,
                price              = :price,
                max_people         = :max_people,
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
            error_log("Error en updateActivity: " . $e->getMessage());
            return ['error' => 'exception', 'message' => $e->getMessage()];
        }
    }

    /**
     * Eliminar una actividad por su ID
     * @param int $id ID de la actividad
     * @return bool True si se elimina correctamente, false si falla
     */
    public function deleteActivity($id)
    {
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Obtener actividades según su estado
     * @param string $state Estado de la actividad ('pendiente', 'aprobada', 'rechazada')
     * @return array Lista de actividades con ese estado
     */
    public function getActivitiesByState($state)
    {
        $sql = "SELECT 
                    a.*,
                    u.full_name AS offertant_name,
                    c.name AS category_name,
                    IFNULL(
                        (SELECT GROUP_CONCAT(participant_id)
                         FROM registrations r
                         WHERE r.activity_id = a.id
                        ), ''
                    ) AS enrolled_user_ids
                FROM {$this->table_name} a
                LEFT JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.state = :state AND a.is_completed = 0
                ORDER BY a.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['state' => $state]);

        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($activities as &$activity) {
            $activity['enrolled_user_ids'] = $activity['enrolled_user_ids'] !== ''
                ? array_map('intval', explode(',', $activity['enrolled_user_ids']))
                : [];
        }

        return $activities;
    }

    /**
     * Actualizar el estado de una actividad
     * @param int $id ID de la actividad
     * @param string $newState Nuevo estado ('pendiente', 'aprobada', 'rechazada')
     * @return bool True si se actualiza correctamente
     */
    public function updateState($id, $newState)
    {
        $sql = "UPDATE {$this->table_name} SET state = :state WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id, 'state' => $newState]);
    }

    /**
     * Obtener estadísticas de las actividades
     * @return array Contiene:
     *  - total: total de actividades
     *  - pendiente: cantidad de actividades pendientes
     *  - aprobada: cantidad de actividades aprobadas
     *  - rechazada: cantidad de actividades rechazadas
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
     * Obtener actividades activas en las que participa un usuario
     * @param int $participant_id ID del participante
     * @return array Lista de actividades activas
     */
    public function getActivitiesByParticipantId($participant_id)
    {
        $sql = "SELECT a.*, c.name AS category_name
                FROM activities a
                INNER JOIN registrations r ON a.id = r.activity_id
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE r.participant_id = :user_id
                AND a.is_finished = 0";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['user_id' => $participant_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener actividades finalizadas en las que participó un usuario
     * @param int $participant_id ID del participante
     * @return array Lista de actividades finalizadas
     */
    public function getActivitiesFinishedByParticipantId($participant_id)
    {
        $sql = "SELECT a.*, c.name AS category_name
                FROM activities a
                INNER JOIN registrations r ON a.id = r.activity_id
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE r.participant_id = :user_id
                AND a.date < CURDATE()";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['user_id' => $participant_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>