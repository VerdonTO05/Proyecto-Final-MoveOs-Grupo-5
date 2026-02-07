<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/Activity.php';
require_once __DIR__ . '/../app/models/entities/Request.php';
require_once __DIR__ . '/../config/database.php';

class ActivityRequestTest extends TestCase
{
    private $pdo;
    private $activityModel;
    private $requestModel;
    private $userId;
    private $userEmail = 'test@example.com';

    protected function setUp(): void
    {
        $this->pdo = new PDO('mysql:host=localhost;dbname=moveos_test;charset=utf8', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Limpiar tablas relevantes
        $this->pdo->exec("DELETE FROM activities");
        $this->pdo->exec("DELETE FROM requests");
        $this->pdo->exec("DELETE FROM users");

        // Insertar un usuario de prueba
        $passwordHash = password_hash('123456', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (full_name, email, username, password_hash, state, role_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['Test User', $this->userEmail, 'testuser', $passwordHash, 'activa', 2]); // role_id = 2 por ejemplo

        $this->userId = $this->pdo->lastInsertId();

        $this->activityModel = new Activity($this->pdo);
        $this->requestModel = new Request($this->pdo);
    }

    public function testCreateActivity()
    {
        $data = [
            'offertant_id' => $this->userId,
            'category_id' => 1,
            'title' => 'Excursión test',
            'description' => 'Una excursión para probar la creación de actividades.',
            'date' => date('Y-m-d', strtotime('+1 day')),
            'time' => '10:00',
            'price' => 10,
            'max_people' => 5,
            'current_registrations' => 0,
            'organizer_email' => $this->userEmail,
            'location' => 'Ciudad de prueba',
            'transport_included' => 1,
            'departure_city' => 'Ciudad de salida',
            'language' => 'Español',
            'min_age' => 18,
            'pets_allowed' => 0,
            'dress_code' => 'Casual',
            'image_url' => 'uploads/activities/test.png',
            'state' => 'pendiente'
        ];

        $result = $this->activityModel->createActivity($data);
        $this->assertTrue($result);

        // Verificar que se insertó
        $stmt = $this->pdo->prepare("SELECT * FROM activities WHERE title = ?");
        $stmt->execute([$data['title']]);
        $activity = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertNotEmpty($activity);
        $this->assertEquals($data['title'], $activity['title']);
        $this->assertEquals($data['organizer_email'], $activity['organizer_email']);
    }

    public function testCreateRequest()
    {
        $data = [
            'participant_id' => $this->userId,
            'category_id' => 2,
            'title' => 'Petición test',
            'description' => 'Prueba de creación de peticiones.',
            'date' => date('Y-m-d', strtotime('+2 days')),
            'time' => '15:00',
            'location' => 'Ciudad de prueba',
            'current_registrations' => 0,
            'organizer_email' => $this->userEmail,
            'transport_included' => 0,
            'departure_city' => '',
            'language' => 'Español',
            'min_age' => 18,
            'pets_allowed' => 0,
            'dress_code' => '',
            'image_url' => 'uploads/activities/request_test.png',
            'state' => 'pendiente'
        ];

        $result = $this->requestModel->createRequest($data);
        $this->assertTrue($result);

        // Verificar que se insertó
        $stmt = $this->pdo->prepare("SELECT * FROM requests WHERE title = ?");
        $stmt->execute([$data['title']]);
        $request = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertNotEmpty($request);
        $this->assertEquals($data['title'], $request['title']);
        $this->assertEquals($data['participant_id'], $request['participant_id']);
    }
}
