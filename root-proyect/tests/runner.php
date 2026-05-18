<?php
declare(strict_types=1);

if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'])) {
  http_response_code(403);
  exit('Acceso restringido. Solo accesible desde localhost.');
}

define('ROOT', dirname(__DIR__));
define('PHP_BIN', 'C:\\xampp\\php\\php.exe');
define('PHPUNIT_BIN', ROOT . '\\vendor\\bin\\phpunit');
define('BENCH_SCRIPT', ROOT . '\\benchmark.ps1');
define('REPORT_HTML', ROOT . '\\tests\\performance\\report.html');
define('PHPDOC_BIN', ROOT . '\\phpdoc.phar');
define('DOCS_INDEX', ROOT . '\\public\\docsPHP\\index.html');
define('JSDOC_BIN', ROOT . '\\node_modules\\.bin\\jsdoc.cmd');
define('JSDOC_INDEX', ROOT . '\\public\\docsJS\\index.html');

// ── AJAX: ejecutar PHPUnit ────────────────────────────────────
if (isset($_POST['action']) && $_POST['action'] === 'run_phpunit') {
  header('Content-Type: application/json; charset=utf-8');

  $suites = [
    'all' => '',
    'mock' => 'tests\\UserMockTest.php',
    'login' => 'tests\\LoginTest.php',
    'register' => 'tests\\RegisterTest.php',
    'edit' => 'tests\\EditInfoTest.php',
    'activity' => 'tests\\ActivityRequestTest.php',
    'security' => 'tests\\SecurityTest.php',
  ];

  $suite = $_POST['suite'] ?? 'all';
  if (!array_key_exists($suite, $suites)) {
    echo json_encode(['error' => 'Suite no valida']);
    exit;
  }

  $testArg = $suites[$suite] ? '"' . $suites[$suite] . '"' : '';
  $cmd = '"' . PHP_BIN . '" "' . PHPUNIT_BIN . '" ' . $testArg . ' --testdox 2>&1';

  $proc = proc_open(
    'cd /d "' . ROOT . '" && ' . $cmd,
    [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
    $pipes
  );

  if (!is_resource($proc)) {
    echo json_encode(['error' => 'No se pudo lanzar PHPUnit']);
    exit;
  }

  fclose($pipes[0]);
  $out = stream_get_contents($pipes[1]);
  fclose($pipes[1]);
  fclose($pipes[2]);
  $code = proc_close($proc);

  echo json_encode(['output' => $out, 'exit_code' => $code, 'passed' => ($code === 0)]);
  exit;
}

// ── AJAX: regenerar PHPDoc ────────────────────────────────────
if (isset($_POST['action']) && $_POST['action'] === 'run_phpdoc') {
  header('Content-Type: application/json; charset=utf-8');

  $cmd = '"' . PHP_BIN . '" "' . PHPDOC_BIN . '" run 2>&1';

  $proc = proc_open(
    'cd /d "' . ROOT . '" && ' . $cmd,
    [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
    $pipes
  );

  if (!is_resource($proc)) {
    echo json_encode(['error' => 'No se pudo lanzar phpDocumentor']);
    exit;
  }

  fclose($pipes[0]);
  $out = stream_get_contents($pipes[1]);
  fclose($pipes[1]);
  fclose($pipes[2]);
  $code = proc_close($proc);

  echo json_encode([
    'output' => $out,
    'exit_code' => $code,
    'docs_exists' => file_exists(DOCS_INDEX),
  ]);
  exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'run_jsdoc') {
  header('Content-Type: application/json; charset=utf-8');

  $cmd = '"' . JSDOC_BIN . '" -c jsdoc.json 2>&1';

  $proc = proc_open(
    'cd /d "' . ROOT . '" && ' . $cmd,
    [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
    $pipes
  );

  if (!is_resource($proc)) {
    echo json_encode(['error' => 'No se pudo lanzar JSDoc']);
    exit;
  }

  fclose($pipes[0]);
  $out = stream_get_contents($pipes[1]);
  fclose($pipes[1]);
  fclose($pipes[2]);
  $code = proc_close($proc);

  echo json_encode([
    'output' => $out,
    'exit_code' => $code,
    'docs_exists' => file_exists(JSDOC_INDEX),
  ]);
  exit;
}

// ── AJAX: ejecutar Benchmark ──────────────────────────────────
if (isset($_POST['action']) && $_POST['action'] === 'run_benchmark') {
  header('Content-Type: application/json; charset=utf-8');

  $req = max(10, min(2000, (int) ($_POST['requests'] ?? 200)));
  $conc = max(1, min(100, (int) ($_POST['concurrency'] ?? 10)));
  $ck = preg_replace('/[^a-zA-Z0-9=_;,.\-]/', '', $_POST['cookie'] ?? '');
  $args = "-Requests $req -Concurrency $conc" . ($ck ? " -SessionCookie \"$ck\"" : '');

  exec('powershell -NonInteractive -File "' . BENCH_SCRIPT . "\" $args 2>&1", $lines, $code);

  echo json_encode([
    'output' => implode("\n", $lines),
    'exit_code' => $code,
    'report_exists' => file_exists(REPORT_HTML)
  ]);
  exit;
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Runner — MOVEos</title>

  <!-- Estilos del proyecto (variables, cards, stats, header…) -->
  <link rel="stylesheet" href="../public/assets/css/main.css">
  <!-- Iconos -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <!-- Dark mode: aplica la clase .dark-mode antes del primer render -->
  <script src="../public/assets/js/theme-init.js"></script>

  <style>
    /* ── Layout runner ─────────────────────────────────────── */
    .runner-wrap {
      display: flex;
      flex: 1;
      min-height: calc(100vh - 64px);
    }

    /* ── Sidebar ────────────────────────────────────────────── */
    .runner-side {
      width: 220px;
      flex-shrink: 0;
      background: linear-gradient(to bottom, var(--brand-primary), var(--brand-dark));
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .side-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, .5);
      padding: .75rem 1.25rem .35rem;
    }

    .suite-btn {
      display: flex;
      align-items: center;
      gap: .7rem;
      width: 100%;
      padding: .75rem 1.25rem;
      background: none;
      border: none;
      border-left: 3px solid transparent;
      color: rgba(255, 255, 255, .8);
      font-size: .875rem;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: background .15s, border-color .15s, color .15s;
    }

    .suite-btn:hover {
      background: rgba(0, 0, 0, .2);
      color: #fff;
    }

    .suite-btn.active {
      background: rgba(0, 0, 0, .25);
      border-left-color: #fff;
      color: #fff;
      font-weight: 600;
    }

    .suite-btn i {
      width: 16px;
      text-align: center;
      font-size: .85rem;
    }

    .suite-count {
      margin-left: auto;
      background: rgba(255, 255, 255, .18);
      color: #fff;
      border-radius: 12px;
      padding: 1px 8px;
      font-size: .68rem;
      font-weight: 600;
    }

    .side-divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, .15);
      margin: .75rem 1rem;
    }

    /* ── Main panel ─────────────────────────────────────────── */
    .runner-main {
      flex: 1;
      background: var(--bg-main);
      padding: 2% 2.5%;
      overflow-y: auto;
    }

    /* Reutiliza .header, .header-icon, .header-content de _control.scss */
    .runner-page-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 15px;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
    }

    /* Botón principal: color brand */
    .btn-run,
    .btn-bench {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .55rem 1.2rem;
      border: none;
      border-radius: 8px;
      font-size: .875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: opacity .15s;
      margin-left: auto;
    }

    .btn-run {
      background: var(--brand-primary);
      color: #fff;
    }

    .btn-bench {
      background: var(--accent-purple, #9b59b6);
      color: #fff;
    }

    .btn-run:hover,
    .btn-bench:hover {
      opacity: .85;
    }

    .btn-run:disabled,
    .btn-bench:disabled {
      opacity: .45;
      cursor: default;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .5rem 1rem;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: .85rem;
      font-family: inherit;
      text-decoration: none;
      cursor: pointer;
      transition: border-color .15s, color .15s;
    }

    .btn-secondary:hover {
      border-color: var(--brand-primary);
      color: var(--brand-primary);
    }

    /* Badge resultado */
    .result-badge {
      display: none;
      align-items: center;
      gap: .35rem;
      font-size: .75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .result-badge.pass {
      display: inline-flex;
      background: rgba(var(--c-green-rgb), .2);
      color: var(--c-green);
    }

    .result-badge.fail {
      display: inline-flex;
      background: rgba(var(--c-red-rgb), .2);
      color: var(--c-red);
    }

    /* Reutiliza .stats y .card de _control.scss — solo añadimos valores */
    .card h2 {
      font-size: 2rem;
      margin-bottom: 4px;
    }

    .card p {
      font-weight: 600;
    }

    .card small {
      color: var(--text-secondary);
    }

    /* Panel output */
    .output-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      overflow: hidden;
      margin-top: 1.5rem;
    }

    .output-head {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .7rem 1.25rem;
      background: var(--bg-muted);
      border-bottom: 1px solid var(--border-color);
      font-size: .82rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    #output,
    #bench-output {
      font-family: 'Cascadia Code', 'Fira Mono', Consolas, monospace;
      font-size: .79rem;
      line-height: 1.85;
      padding: 1.25rem;
      min-height: 140px;
      max-height: 52vh;
      overflow-y: auto;
      white-space: pre-wrap;
      color: var(--text-secondary);
    }

    /* Colores output PHPUnit — usan variables del proyecto */
    .t-pass {
      color: var(--c-green);
    }

    .t-fail {
      color: var(--c-red);
    }

    .t-error {
      color: var(--c-yellow);
    }

    .t-suite {
      color: var(--brand-primary);
      font-weight: 700;
      display: block;
      margin-top: .6rem;
    }

    .t-ok {
      color: var(--c-green);
      font-weight: 700;
    }

    .t-err-sum {
      color: var(--c-red);
      font-weight: 700;
    }

    .t-time {
      color: var(--text-secondary);
      font-size: .74rem;
    }

    /* Spinner */
    .fa-spinner {
      font-size: .85rem;
    }

    /* Formulario benchmark */
    .bench-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      padding: 1.25rem;
    }

    .form-field label {
      display: block;
      font-size: .7rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: .05em;
      font-weight: 600;
      margin-bottom: .4rem;
    }

    .form-field input {
      width: 100%;
      background: var(--bg-main);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: .875rem;
      padding: .55rem .875rem;
      outline: none;
      font-family: inherit;
      transition: border-color .15s;
    }

    .form-field input:focus {
      border-color: var(--brand-primary);
    }

    .bench-actions {
      display: flex;
      align-items: center;
      gap: .75rem;
      flex-wrap: wrap;
      padding: 0 1.25rem 1.25rem;
    }

    /* Ocultar vistas inactivas */
    .view {
      display: none;
    }

    .view.active {
      display: block;
    }

    /* Responsive */
    @media (max-width: 700px) {
      .runner-side {
        width: 54px;
      }

      .suite-btn .lbl,
      .side-label,
      .suite-count {
        display: none;
      }

      .suite-btn {
        padding: .85rem;
        justify-content: center;
      }

      .runner-main {
        padding: 1rem;
      }
    }
  </style>
</head>

<body>

  <!-- ════════════════════ TOP HEADER ════════════════════════ -->
  <header>
    <nav>
      <div class="logo-container">
        <a href="../public/index.php">
          <img src="../public/assets/img/ico/icono.svg" alt="MOVEos">
          <span>MOVEos</span>
        </a>
      </div>

      <span style="color:var(--text-secondary);font-size:.9rem;font-weight:500">
        <i class="fas fa-vial" style="color:var(--brand-primary);margin-right:.4rem"></i>
        Test Runner
      </span>

      <div>
        <!-- Toggle dark mode (misma lógica que el resto de páginas) -->
        <button id="theme-toggle" title="Cambiar tema" style="
        background:none;border:none;cursor:pointer;
        color:var(--brand-primary);font-size:1.1rem;padding:.4rem .6rem;border-radius:8px;">
          <i class="fas fa-moon"></i>
        </button>
      </div>
    </nav>
  </header>

  <!-- ════════════════════ LAYOUT ═════════════════════════ -->
  <div class="runner-wrap">

    <!-- ── SIDEBAR ── -->
    <nav class="runner-side" aria-label="Suites de test">

      <p class="side-label">PHPUnit</p>

      <button class="suite-btn active"
        onclick="selectSuite('all',this,'Todas las suites','Ejecuta mocks + integracion + seguridad en una sola pasada.')">
        <i class="fas fa-play-circle"></i><span class="lbl">Todas</span><span class="suite-count">34</span>
      </button>
      <button class="suite-btn"
        onclick="selectSuite('mock',this,'Mocks — UserMockTest','Pruebas unitarias puras con PDO simulado. No requieren MySQL.')">
        <i class="fas fa-clone"></i><span class="lbl">Mocks</span><span class="suite-count">9</span>
      </button>
      <button class="suite-btn"
        onclick="selectSuite('login',this,'Login','Pruebas de inicio de sesion con base de datos real.')">
        <i class="fas fa-lock"></i><span class="lbl">Login</span><span class="suite-count">3</span>
      </button>
      <button class="suite-btn"
        onclick="selectSuite('register',this,'Registro','Pruebas de registro de nuevos usuarios.')">
        <i class="fas fa-user-plus"></i><span class="lbl">Registro</span><span class="suite-count">3</span>
      </button>
      <button class="suite-btn"
        onclick="selectSuite('edit',this,'Edicion de perfil','Actualizacion de datos y contrasena de usuario.')">
        <i class="fas fa-user-edit"></i><span class="lbl">Edicion</span><span class="suite-count">2</span>
      </button>
      <button class="suite-btn"
        onclick="selectSuite('activity',this,'Actividades y Peticiones','Creacion de actividades y peticiones con BD real.')">
        <i class="fas fa-running"></i><span class="lbl">Actividades</span><span class="suite-count">2</span>
      </button>
      <button class="suite-btn"
        onclick="selectSuite('security',this,'Seguridad','Inyeccion SQL, hashing bcrypt y entradas extremas.')">
        <i class="fas fa-shield-alt"></i><span class="lbl">Seguridad</span><span class="suite-count">15</span>
      </button>

      <hr class="side-divider">

      <p class="side-label">Rendimiento</p>

      <button class="suite-btn" onclick="switchView('benchmark',this)">
        <i class="fas fa-bolt"></i><span class="lbl">Apache Bench</span>
      </button>

      <hr class="side-divider">

      <p class="side-label">Documentacion</p>

      <button class="suite-btn" onclick="switchView('docs',this)">
        <i class="fas fa-book"></i><span class="lbl">PHPDoc</span>
      </button>

      <button class="suite-btn" onclick="switchView('jsdoc',this)">
        <i class="fas fa-file-code"></i><span class="lbl">JSDoc</span>
      </button>

    </nav>

    <!-- ═══════════════════ VISTA PHPUNIT ═══════════════════ -->
    <div id="view-phpunit" class="runner-main view active">

      <!-- Header interno (misma clase que el panel de control) -->
      <div class="runner-page-header">
        <div class="header-icon" aria-hidden="true">
          <i class="fas fa-vial"></i>
        </div>
        <div class="header-content">
          <h1 id="suite-title">Todas las suites</h1>
          <p id="suite-desc">Ejecuta mocks + integracion + seguridad en una sola pasada.</p>
        </div>
        <span id="result-badge" class="result-badge" aria-live="polite"></span>
        <button id="run-btn" class="btn-run" onclick="runPhpunit()">
          <i class="fas fa-play" id="run-icon"></i>
          <span id="run-label">Ejecutar</span>
        </button>
      </div>

      <!-- Stats (reutiliza .stats + .card + modificadores de _control.scss) -->
      <section class="stats" aria-label="Resultados">
        <div class="card approved" role="region">
          <i class="fas fa-check-circle icon" aria-hidden="true"></i>
          <h2 id="stat-pass">—</h2>
          <p>Pasados</p>
          <small>tests correctos</small>
        </div>
        <div class="card rejected" role="region">
          <i class="fas fa-times-circle icon" aria-hidden="true"></i>
          <h2 id="stat-fail">—</h2>
          <p>Fallidos</p>
          <small>requieren atencion</small>
        </div>
        <div class="card total" role="region">
          <i class="fas fa-list-ul icon" aria-hidden="true"></i>
          <h2 id="stat-total">—</h2>
          <p>Total tests</p>
          <small>aserciones ejecutadas</small>
        </div>
        <div class="card pending" role="region">
          <i class="fas fa-stopwatch icon" aria-hidden="true"></i>
          <h2 id="stat-time">—</h2>
          <p>Tiempo</p>
          <small>duracion total</small>
        </div>
      </section>

      <!-- Output -->
      <div class="output-panel">
        <div class="output-head">
          <i class="fas fa-terminal"></i>
          Salida del test
        </div>
        <div id="output" aria-live="polite" aria-label="Resultado de las pruebas">
          <span>Selecciona una suite en el panel izquierdo y pulsa Ejecutar.</span>
        </div>
      </div>

    </div><!-- /view-phpunit -->

    <!-- ═══════════════════ VISTA BENCHMARK ═════════════════ -->
    <div id="view-benchmark" class="runner-main view">

      <div class="runner-page-header">
        <div class="header-icon" aria-hidden="true">
          <i class="fas fa-bolt"></i>
        </div>
        <div class="header-content">
          <h1>Apache Benchmark</h1>
          <p>Prueba de carga HTTP contra los endpoints de MOVEos</p>
        </div>
        <button id="bench-run-btn" class="btn-bench" onclick="runBenchmark()">
          <i class="fas fa-bolt" id="bench-icon"></i>
          <span id="bench-label">Lanzar prueba</span>
        </button>
      </div>

      <!-- Formulario de configuracion -->
      <div class="output-panel">
        <div class="output-head">
          <i class="fas fa-sliders-h"></i> Configuracion
        </div>
        <form class="bench-form" onsubmit="return false;">
          <div class="form-field">
            <label for="b-requests">Peticiones totales</label>
            <input type="number" id="b-requests" value="200" min="10" max="2000">
          </div>
          <div class="form-field">
            <label for="b-concurrency">Concurrencia</label>
            <input type="number" id="b-concurrency" value="10" min="1" max="100">
          </div>
          <div class="form-field">
            <label for="b-cookie">Cookie de sesion (opcional)</label>
            <input type="text" id="b-cookie" placeholder="PHPSESSID=abc123">
          </div>
        </form>
        <div class="bench-actions">
          <span id="bench-badge" class="result-badge" aria-live="polite"></span>
          <a id="report-link" class="btn-secondary" href="performance/report.html" target="_blank" style="display:none">
            <i class="fas fa-chart-bar"></i> Ver informe completo
          </a>
        </div>
      </div>

      <!-- Output -->
      <div class="output-panel" style="margin-top:1.25rem">
        <div class="output-head">
          <i class="fas fa-terminal"></i> Salida
        </div>
        <div id="bench-output" aria-live="polite">Configura los parametros y pulsa "Lanzar prueba".</div>
      </div>

    </div><!-- /view-benchmark -->

    <!-- ═══════════════════ VISTA DOCS ══════════════════════ -->
    <div id="view-docs" class="runner-main view">

      <div class="runner-page-header">
        <div class="header-icon" aria-hidden="true">
          <i class="fas fa-book"></i>
        </div>
        <div class="header-content">
          <h1>PHPDoc — Documentacion PHP</h1>
          <p>Regenera la documentacion desde los docblocks del codigo fuente</p>
        </div>
        <button id="docs-run-btn" class="btn-run" onclick="runPhpdoc()" style="background:var(--brand-primary)">
          <i class="fas fa-sync-alt" id="docs-icon"></i>
          <span id="docs-label">Regenerar docs</span>
        </button>
      </div>

      <!-- Info card -->
      <div class="output-panel">
        <div class="output-head">
          <i class="fas fa-info-circle"></i> Configuracion activa
        </div>
        <div style="padding:1rem 1.25rem;font-size:.875rem;color:var(--text-secondary);line-height:1.7">
          <p><strong style="color:var(--text-primary)">Fuente:</strong> <code>app/</code></p>
          <p><strong style="color:var(--text-primary)">Salida:</strong> <code>public/docsPHP/</code></p>
          <p><strong style="color:var(--text-primary)">Config:</strong> <code>phpdoc.xml</code> en la raiz del proyecto
          </p>
          <p><strong style="color:var(--text-primary)">Paquetes:</strong> Access &bull; Admin &bull; API &bull; Chat
            &bull; Publications &bull; Services &bull; User</p>
        </div>
        <div style="padding:0 1.25rem 1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
          <span id="docs-badge" class="result-badge" aria-live="polite"></span>
          <a id="docs-link" class="btn-secondary" href="../public/docsPHP/index.html" target="_blank"
            style="<?= file_exists(DOCS_INDEX) ? '' : 'display:none' ?>">
            <i class="fas fa-external-link-alt"></i> Abrir documentacion
          </a>
        </div>
      </div>

      <!-- Output -->
      <div class="output-panel" style="margin-top:1.25rem">
        <div class="output-head">
          <i class="fas fa-terminal"></i> Salida de phpDocumentor
        </div>
        <div id="docs-output" aria-live="polite" style="font-family:'Cascadia Code','Fira Mono',Consolas,monospace;font-size:.79rem;line-height:1.85;
                  padding:1.25rem;min-height:140px;max-height:52vh;overflow-y:auto;white-space:pre-wrap;
                  color:var(--text-secondary)">
          Pulsa "Regenerar docs" para actualizar la documentacion HTML.
        </div>
      </div>

    </div><!-- /view-docs -->
    <!-- ═══════════════════ VISTA JSDOC ══════════════════════ -->
    <div id="view-jsdoc" class="runner-main view">

      <div class="runner-page-header">
        <div class="header-icon" aria-hidden="true">
          <i class="fas fa-file-code"></i>
        </div>
        <div class="header-content">
          <h1>JSDoc — Documentación JavaScript</h1>
          <p>Regenera la documentación desde los docblocks del código fuente JS</p>
        </div>
        <button id="jsdoc-run-btn" class="btn-run" onclick="runJsdoc()">
          <i class="fas fa-sync-alt" id="jsdoc-icon"></i>
          <span id="jsdoc-label">Regenerar docs</span>
        </button>
      </div>

      <div class="output-panel">
        <div class="output-head">
          <i class="fas fa-info-circle"></i> Configuración activa
        </div>
        <div style="padding:1rem 1.25rem;font-size:.875rem;color:var(--text-secondary);line-height:1.7">
          <p><strong style="color:var(--text-primary)">Fuente:</strong> <code>public/assets/js/</code></p>
          <p><strong style="color:var(--text-primary)">Salida:</strong> <code>public/docsJS/</code></p>
          <p><strong style="color:var(--text-primary)">Config:</strong> <code>jsdoc.json</code> en la raíz del proyecto
          </p>
        </div>
        <div style="padding:0 1.25rem 1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
          <span id="jsdoc-badge" class="result-badge" aria-live="polite"></span>
          <a id="jsdoc-link" class="btn-secondary" href="../public/docsJS/index.html" target="_blank"
            style="<?= file_exists(JSDOC_INDEX) ? '' : 'display:none' ?>">
            <i class="fas fa-external-link-alt"></i> Abrir documentación
          </a>
        </div>
      </div>

      <div class="output-panel" style="margin-top:1.25rem">
        <div class="output-head">
          <i class="fas fa-terminal"></i> Salida de JSDoc
        </div>
        <div id="jsdoc-output" aria-live="polite" style="font-family:'Cascadia Code','Fira Mono',Consolas,monospace;font-size:.79rem;line-height:1.85;
                padding:1.25rem;min-height:140px;max-height:52vh;overflow-y:auto;white-space:pre-wrap;
                color:var(--text-secondary)">
          Pulsa "Regenerar docs" para actualizar la documentación HTML.
        </div>
      </div>

    </div><!-- /view-jsdoc -->

  </div><!-- /runner-wrap -->

  <script>
    // ──────────────────────────────────────────────
    //  Dark mode toggle (igual que en el resto de páginas)
    // ──────────────────────────────────────────────
    (function () {
      const btn = document.getElementById('theme-toggle');
      function applyTheme(dark) {
        document.body.classList.toggle('dark-mode', dark);
        btn.querySelector('i').className = dark ? 'fas fa-sun' : 'fas fa-moon';
      }
      applyTheme(document.body.classList.contains('dark-mode'));
      btn.addEventListener('click', function () {
        const isDark = !document.body.classList.contains('dark-mode');
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
    })();

    // ──────────────────────────────────────────────
    //  Navegacion
    // ──────────────────────────────────────────────
    let currentSuite = 'all';

    function switchView(view, btn) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.suite-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
      btn.classList.add('active');
    }

    function selectSuite(suite, btn, title, desc) {
      switchView('phpunit', btn);
      currentSuite = suite;
      document.getElementById('suite-title').textContent = title;
      document.getElementById('suite-desc').textContent = desc;
      resetStats();
      document.getElementById('output').innerHTML =
        '<span>Pulsa <strong>Ejecutar</strong> para lanzar la suite.</span>';
      const b = document.getElementById('result-badge');
      b.className = 'result-badge';
      b.textContent = '';
    }

    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────
    function esc(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function resetStats() {
      ['stat-pass', 'stat-fail', 'stat-total', 'stat-time'].forEach(id => {
        document.getElementById(id).textContent = '—';
      });
    }

    // ──────────────────────────────────────────────
    //  Parsear salida testdox de PHPUnit
    // ──────────────────────────────────────────────
    function parseOutput(raw) {
      let pass = 0, fail = 0, total = 0, time = '—', html = '';

      raw.split('\n').forEach(line => {
        const t = line.trimEnd();
        if (/^\s+[✔✓]/.test(t)) { pass++; html += `<span class="t-pass">${esc(t)}</span>\n`; }
        else if (/^\s+[✘✗F]/.test(t) || /^\s+FAIL/.test(t)) { fail++; html += `<span class="t-fail">${esc(t)}</span>\n`; }
        else if (/^\s+E.*Error/.test(t)) { html += `<span class="t-error">${esc(t)}</span>\n`; }
        else if (/^OK \(/.test(t)) {
          const m = t.match(/(\d+) tests?/); if (m) total = +m[1];
          html += `<span class="t-ok">${esc(t)}</span>\n`;
        }
        else if (/FAILURES!|Tests: \d+/.test(t)) {
          const m = t.match(/Tests: (\d+)/); if (m) total = +m[1];
          html += `<span class="t-err-sum">${esc(t)}</span>\n`;
        }
        else if (/^Time:/.test(t)) {
          const m = t.match(/Time:\s+(.+?),/); if (m) time = m[1].trim();
          html += `<span class="t-time">${esc(t)}</span>\n`;
        }
        else if (/^[A-Z].*[Tt]est/.test(t) || /^Pruebas/.test(t)) { html += `<span class="t-suite">${esc(t)}</span>\n`; }
        else { html += esc(t) + '\n'; }
      });

      return { html, pass, fail, total: total || (pass + fail), time };
    }

    // ──────────────────────────────────────────────
    //  Ejecutar PHPUnit
    // ──────────────────────────────────────────────
    function runPhpunit() {
      const runBtn = document.getElementById('run-btn');
      const runIcon = document.getElementById('run-icon');
      const runLbl = document.getElementById('run-label');
      const badge = document.getElementById('result-badge');
      const output = document.getElementById('output');

      runBtn.disabled = true;
      runIcon.className = 'fas fa-spinner fa-spin';
      runLbl.textContent = 'Ejecutando...';
      badge.className = 'result-badge';
      badge.textContent = '';
      output.innerHTML = '<span>Ejecutando suite, espera un momento...</span>';
      resetStats();

      const fd = new FormData();
      fd.append('action', 'run_phpunit');
      fd.append('suite', currentSuite);

      fetch(location.href, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            output.innerHTML = `<span class="t-fail">Error: ${esc(data.error)}</span>`;
            return;
          }
          const { html, pass, fail, total, time } = parseOutput(data.output);
          output.innerHTML = html;
          output.scrollTop = output.scrollHeight;

          document.getElementById('stat-pass').textContent = pass;
          document.getElementById('stat-fail').textContent = fail;
          document.getElementById('stat-total').textContent = total;
          document.getElementById('stat-time').textContent = time;

          badge.className = 'result-badge ' + (data.passed ? 'pass' : 'fail');
          badge.innerHTML = data.passed
            ? '<i class="fas fa-check-circle"></i> Todos pasaron'
            : '<i class="fas fa-times-circle"></i> Hay fallos';
        })
        .catch(err => {
          output.innerHTML = `<span class="t-fail">Error de red: ${esc(String(err))}</span>`;
        })
        .finally(() => {
          runBtn.disabled = false;
          runIcon.className = 'fas fa-play';
          runLbl.textContent = 'Ejecutar';
        });
    }

    // ──────────────────────────────────────────────
    //  Ejecutar Apache Benchmark
    // ──────────────────────────────────────────────
    function runBenchmark() {
      const btn = document.getElementById('bench-run-btn');
      const icon = document.getElementById('bench-icon');
      const lbl = document.getElementById('bench-label');
      const output = document.getElementById('bench-output');
      const badge = document.getElementById('bench-badge');

      btn.disabled = true;
      icon.className = 'fas fa-spinner fa-spin';
      lbl.textContent = 'Ejecutando...';
      output.textContent = 'Lanzando Apache Benchmark, esto puede tardar 30-60 segundos...';
      badge.className = 'result-badge';
      badge.textContent = '';

      const fd = new FormData();
      fd.append('action', 'run_benchmark');
      fd.append('requests', document.getElementById('b-requests').value);
      fd.append('concurrency', document.getElementById('b-concurrency').value);
      fd.append('cookie', document.getElementById('b-cookie').value);

      fetch(location.href, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          output.textContent = data.output || '(sin salida)';
          const link = document.getElementById('report-link');
          if (data.report_exists) link.style.display = 'inline-flex';
          badge.className = 'result-badge ' + (data.exit_code === 0 ? 'pass' : 'fail');
          badge.innerHTML = data.exit_code === 0
            ? '<i class="fas fa-check-circle"></i> Completado'
            : '<i class="fas fa-times-circle"></i> Error';
        })
        .catch(err => { output.textContent = 'Error de red: ' + String(err); })
        .finally(() => {
          btn.disabled = false;
          icon.className = 'fas fa-bolt';
          lbl.textContent = 'Lanzar prueba';
        });
    }

    // ──────────────────────────────────────────────
    //  Regenerar PHPDoc
    // ──────────────────────────────────────────────
    function runPhpdoc() {
      const btn = document.getElementById('docs-run-btn');
      const icon = document.getElementById('docs-icon');
      const lbl = document.getElementById('docs-label');
      const output = document.getElementById('docs-output');
      const badge = document.getElementById('docs-badge');

      btn.disabled = true;
      icon.className = 'fas fa-spinner fa-spin';
      lbl.textContent = 'Generando...';
      output.textContent = 'Ejecutando phpDocumentor, esto puede tardar unos segundos...';
      badge.className = 'result-badge';
      badge.textContent = '';

      const fd = new FormData();
      fd.append('action', 'run_phpdoc');

      fetch(location.href, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            output.textContent = 'Error: ' + data.error;
            return;
          }
          output.textContent = data.output || '(sin salida)';
          const link = document.getElementById('docs-link');
          if (data.docs_exists) link.style.display = 'inline-flex';
          badge.className = 'result-badge ' + (data.exit_code === 0 ? 'pass' : 'fail');
          badge.innerHTML = data.exit_code === 0
            ? '<i class="fas fa-check-circle"></i> Documentacion generada'
            : '<i class="fas fa-times-circle"></i> Error al generar';
        })
        .catch(err => { output.textContent = 'Error de red: ' + String(err); })
        .finally(() => {
          btn.disabled = false;
          icon.className = 'fas fa-sync-alt';
          lbl.textContent = 'Regenerar docs';
        });
    }

    // Mostrar enlace al informe si ya existe
    <?php if (file_exists(REPORT_HTML)): ?>
      document.getElementById('report-link').style.display = 'inline-flex';
    <?php endif; ?>

    function runJsdoc() {
      const btn = document.getElementById('jsdoc-run-btn');
      const icon = document.getElementById('jsdoc-icon');
      const lbl = document.getElementById('jsdoc-label');
      const output = document.getElementById('jsdoc-output');
      const badge = document.getElementById('jsdoc-badge');

      btn.disabled = true;
      icon.className = 'fas fa-spinner fa-spin';
      lbl.textContent = 'Generando...';
      output.textContent = 'Ejecutando JSDoc, esto puede tardar unos segundos...';
      badge.className = 'result-badge';
      badge.textContent = '';

      const fd = new FormData();
      fd.append('action', 'run_jsdoc');

      fetch(location.href, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
          if (data.error) { output.textContent = 'Error: ' + data.error; return; }
          output.textContent = data.output || '(sin salida)';
          const link = document.getElementById('jsdoc-link');
          if (data.docs_exists) link.style.display = 'inline-flex';
          badge.className = 'result-badge ' + (data.exit_code === 0 ? 'pass' : 'fail');
          badge.innerHTML = data.exit_code === 0
            ? '<i class="fas fa-check-circle"></i> Documentación generada'
            : '<i class="fas fa-times-circle"></i> Error al generar';
        })
        .catch(err => { output.textContent = 'Error de red: ' + String(err); })
        .finally(() => {
          btn.disabled = false;
          icon.className = 'fas fa-sync-alt';
          lbl.textContent = 'Regenerar docs';
        });
    }
  </script>
</body>

</html>