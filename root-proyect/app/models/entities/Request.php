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

    // public function getParticipant_Id()
    // {
    //     return $this->$participant_id;
    // }
    
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
                LEFT JOIN users ru ON r.accepted_by = ru.id
                JOIN categories c ON r.category_id = c.id
                ORDER BY r.date ASC";
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
                LEFT JOIN users ru ON r.accepted_by = ru.id
                JOIN categories c ON r.category_id = c.id
                WHERE r.id = :id
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Obtener todas las peticiones de un participante específico
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
                ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['participant_id' => $participantId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Crear una nueva petición
     * @param array $data Datos de la petición (debe coincidir con los placeholders del SQL)
     * @return mixed ID de la petición creada o false si falla
     */
    public function createRequest($data)
    {
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
        return false;
    }

    /**
     * Editar una petición existente
     * @param int $id ID de la petición
     * @param array $data Datos a actualizar (debe incluir todas las columnas que se actualizan)
     * @return bool True si se actualizó correctamente, false si falla
     */
    public function updateRequest($data)
    {
        $sql = "UPDATE requests SET
                title = :title,
                description = :description,
                category_id = :category_id,
                location = :location,
                date = :date,
                time = :time,
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
                WHERE r.state = :state
                ORDER BY r.date ASC";
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
     * @return array Contiene:
     *  - total: total de peticiones
     *  - pendiente: cantidad de peticiones pendientes
     *  - aprobada: cantidad de peticiones aprobadas
     *  - rechazada: cantidad de peticiones rechazadas
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