<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');
header('Connection: keep-alive');

try {
    $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
    $bd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $start   = time();
    $timeout = 30;

    // Obtener el último id de audit_logs al conectar
    $stmt = $bd->query('SELECT MAX(id) as max_id FROM audit_logs WHERE table_name IN ("activities", "requests")');
    $lastAuditId = (int) $stmt->fetchColumn();

    while (time() - $start < $timeout) {

        // Detectar nuevas entradas en audit_logs desde la última revisión
        $stmt = $bd->prepare('
            SELECT id, action_type, table_name, record_id
            FROM audit_logs
            WHERE id > ?
            AND table_name IN ("activities", "requests")
            ORDER BY id ASC
        ');
        $stmt->execute([$lastAuditId]);
        $changes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($changes)) {
            $lastAuditId = end($changes)['id'];

            echo "data: " . json_encode([
                'success' => true,
                'reload'  => true,
                'changes' => $changes  // opcional, para debug
            ]) . "\n\n";
            ob_flush();
            flush();
        }

        // Ping para mantener la conexión viva
        echo ": ping\n\n";
        ob_flush();
        flush();

        sleep(2);
    }

    // Avisar al cliente que reconecte
    echo "data: " . json_encode(['reconnect' => true]) . "\n\n";
    ob_flush();
    flush();

} catch (PDOException $e) {
    error_log("SSE activities error: " . $e->getMessage());
}