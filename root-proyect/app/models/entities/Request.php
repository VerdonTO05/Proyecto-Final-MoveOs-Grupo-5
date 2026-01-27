<?php
class Request
{
    private $conn;
    private $table_name = 'requests';
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
    public $max_age;
    public $pets_allowed;
    public $dress_code;
    public $is_accepted;
    public $accepted_by;
    public $created_at;
    public $state;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Obtener todas las peticiones
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

    // Obtener peticion por ID
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

    // Crear una peticion
    public function createRequest($data)
    {
        $sql = "INSERT INTO {$this->table_name} 
                (participant_id, category_id, title, description, date, time, location, current_registrations, organizer_email,
                 transport_included, departure_city, language, min_age, max_age, pets_allowed, dress_code, state)
                VALUES 
                (:participant_id, :category_id, :title, :description, :date, :time, :location, :current_registrations, :organizer_email,
                 :transport_included, :departure_city, :language, :min_age, :max_age, :pets_allowed, :dress_code, :state)";

        $stmt = $this->conn->prepare($sql);
        if ($stmt->execute($data)) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Editar una peticion
    public function editRequest($id, $data)
    {
        $sql = "UPDATE {$this->table_name} SET
                    category_id = :category_id,
                    title = :title,
                    description = :description,
                    date = :date,
                    time = :time,
                    location = :location,
                    current_registrations = :current_registrations,
                    organizer_email = :organizer_email,
                    transport_included = :transport_included,
                    departure_city = :departure_city,
                    language = :language,
                    min_age = :min_age,
                    max_age = :max_age,
                    pets_allowed = :pets_allowed,
                    dress_code = :dress_code,
                    is_accepted = :is_accepted,
                    accepted_by = :accepted_by,
                    state = :state
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $data['id'] = $id;
        return $stmt->execute($data);
    }

    // Eliminar una peticion
    public function deleteRequest($id)
    {
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    // Obtener peticiones por estado
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

    // Actualizar estado de petición
    public function updateState($id, $newState)
    {
        $sql = "UPDATE {$this->table_name} SET state = :state WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id, 'state' => $newState]);
    }
}
?>