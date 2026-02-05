<?php
class Activity
{
    private $conn;
    private $table_name = 'activities';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Crear actividad - CORREGIDO (Sin max_age)
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
                return $this->conn->lastInsertId();
            }
        } catch (PDOException $e) {
            // Esto te ayudará a ver errores si algo falla
            error_log("Error en createActivity: " . $e->getMessage());
            return false;
        }
        return false;
    }

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

    public function getActivityById($id)
    {
        $sql = "SELECT a.*, u.full_name AS offertant_name, c.name AS category_name
                FROM {$this->table_name} a
                JOIN users u ON a.offertant_id = u.id
                JOIN categories c ON a.category_id = c.id
                WHERE a.offertant_id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteActivity($id)
    {
        $sql = "DELETE FROM {$this->table_name} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    // Obtener actividades por estado
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

    // Actualizar estado de actividad
    public function updateState($id, $newState)
    {
        $sql = "UPDATE {$this->table_name} SET state = :state WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute(['id' => $id, 'state' => $newState]);
    }

    // Obtener estadísticas de actividades
    public function getStats()
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN state = 'pendiente' THEN 1 ELSE 0 END) as pendiente,
                    SUM(CASE WHEN state = 'aprobada' THEN 1 ELSE 0 END) as aprobada,
                    SUM(CASE WHEN state = 'rechazada' THEN 1 ELSE 0 END) as rechazada
                FROM {$this->table_name}";
        $stmt = $this->conn->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>