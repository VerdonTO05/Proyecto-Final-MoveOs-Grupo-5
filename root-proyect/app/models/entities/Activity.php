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
        $sql = "INSERT INTO {$this->table_name} 
                (offertant_id, category_id, title, description, date, time, price, max_people, 
                 current_registrations, organizer_email, location, transport_included, 
                 departure_city, language, min_age, pets_allowed, dress_code, image_url, state)
                VALUES
                (:offertant_id, :category_id, :title, :description, :date, :time, :price, :max_people, 
                 :current_registrations, :organizer_email, :location, :transport_included, 
                 :departure_city, :language, :min_age, :pets_allowed, :dress_code, :image_url, :state)";

        $stmt = $this->conn->prepare($sql);

        try {
            if ($stmt->execute($data)) {
                // Retorna el ID de la nueva actividad
                return $this->conn->lastInsertId();
            }
        } catch (PDOException $e) {
            // Guardar error en logs para depuración
            error_log("Error en createActivity: " . $e->getMessage());
            return false;
        }
        return false;
    }

    /**
     * Obtener todas las actividades con información del ofertante y categoría
     * @return array Lista de actividades
     */
    public function getActivities()
    {
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                ORDER BY a.date ASC";
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
        $sql = "SELECT 
                a.*,
                u.full_name AS offertant_name,
                c.name AS category_name
            FROM {$this->table_name} a
            JOIN users u ON a.offertant_id = u.id
            JOIN categories c ON a.category_id = c.id
            WHERE a.offertant_id = :offertant_id
            ORDER BY a.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'offertant_id' => $offertantId
        ]);

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
                JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateActivity($data)
    {
        $sql = "UPDATE activities SET
                title = :title,
                description = :description,
                category_id = :category_id,
                location = :location,
                date = :date,
                time = :time,
                price = :price,
                max_people = :max_people,
                language = :language,
                min_age = :min_age,
                dress_code = :dress_code,
                transport_included = :transport_included,
                departure_city = :departure_city,
                pets_allowed = :pets_allowed
            WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($data);
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
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.state = :state
                ORDER BY a.date ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['state' => $state]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
                    COALESCE(SUM(CASE WHEN state = 'pendiente' THEN 1 ELSE 0 END),0) as pendiente,
                    COALESCE(SUM(CASE WHEN state = 'aprobada' THEN 1 ELSE 0 END),0) as aprobada,
                    COALESCE(SUM(CASE WHEN state = 'rechazada' THEN 1 ELSE 0 END),0) as rechazada
                FROM {$this->table_name}";
        $stmt = $this->conn->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>