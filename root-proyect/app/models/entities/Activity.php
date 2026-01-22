<?php
class Activity {
    private $conn;
    private $table_name = 'activities';

    public $id;
    public $offertant_id;
    public $category_id;
    public $title;
    public $description;
    public $date;
    public $time;
    public $price;
    public $max_people;
    public $current_registrations;
    public $organizer_email;
    public $location;
    public $transport_included;
    public $departure_city;
    public $language;
    public $min_age;
    public $max_age;
    public $pets_allowed;
    public $dress_code;
    public $image_url;
    public $is_completed;
    public $is_finished;
    public $created_at;
    public $state;

    public function __construct($db){
        $this->conn = $db;
    }

    // Obtener todas las actividades
    public function getActivities(){
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                ORDER BY a.date ASC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    // Obtener actividad por ID
    public function getActivityById($id){
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.id = :id
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    // Crear actividad
    public function createActivity($data){
        $sql = "INSERT INTO {$this->table_name} 
                (offertant_id, category_id, title, description, date, time, price, max_people, current_registrations, organizer_email,
                 location, transport_included, departure_city, language, min_age, max_age, pets_allowed, dress_code, image_url, state)
                VALUES
                (:offertant_id, :category_id, :title, :description, :date, :time, :price, :max_people, :current_registrations, :organizer_email,
                 :location, :transport_included, :departure_city, :language, :min_age, :max_age, :pets_allowed, :dress_code, :image_url, :state)";
        
        $stmt = $this->conn->prepare($sql);
        if($stmt->execute($data)){
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Editar actividad
    public function editActivity($id, $data){
        $sql = "UPDATE {$this->table_name} SET
                    category_id = :category_id,
                    title = :title,
                    description = :description,
                    date = :date,
                    time = :time,
                    price = :price,
                    max_people = :max_people,
                    current_registrations = :current_registrations,
                    organizer_email = :organizer_email,
                    location = :location,
                    transport_included = :transport_included,
                    departure_city = :departure_city,
                    language = :language,
                    min_age = :min_age,
                    max_age = :max_age,
                    pets_allowed = :pets_allowed,
                    dress_code = :dress_code,
                    image_url = :image_url,
                    is_completed = :is_completed,
                    is_finished = :is_finished,
                    state = :state
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $data['id'] = $id;
        return $stmt->execute($data);
    }

    // Eliminar actividad
    public function deleteActivity($id){
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
?>
