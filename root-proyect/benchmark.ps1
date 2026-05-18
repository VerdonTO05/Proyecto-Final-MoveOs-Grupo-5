<#
.SYNOPSIS
    Pruebas de rendimiento HTTP para MOVEos usando Apache Benchmark.

.DESCRIPTION
    Ejecuta ab.exe contra los endpoints del proyecto y genera un reporte HTML
    con graficas de barras y tabla de tiempos de respuesta.

.EXAMPLE
    # Endpoints publicos (sin auth)
    .\benchmark.ps1

    # Con sesion autenticada (obtener PHPSESSID del navegador)
    .\benchmark.ps1 -SessionCookie "PHPSESSID=abc123def456"

    # Ajustar carga
    .\benchmark.ps1 -Requests 500 -Concurrency 20
#>

param(
    [int]    $Requests      = 200,
    [int]    $Concurrency   = 10,
    [string] $SessionCookie = "",
    [string] $BaseUrl       = "http://localhost/xampp/Proyecto-Final-MoveOs-Grupo-5/root-proyect/public/index.php"
)

$ab        = "C:\xampp\apache\bin\ab.exe"
$outputDir = Join-Path $PSScriptRoot "tests\performance"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# ---------------------------------------------------------------------------
# Endpoints a testear
# auth=$true solo se incluyen si se pasa -SessionCookie
# ---------------------------------------------------------------------------
$endpoints = @(
    @{ label = "Pagina principal";   url = $BaseUrl;                                auth = $false },
    @{ label = "Vista de login";     url = ($BaseUrl + "?action=loginView");         auth = $false },
    @{ label = "Vista de registro";  url = ($BaseUrl + "?action=register");          auth = $false },
    @{ label = "Listar actividades"; url = ($BaseUrl + "?action=getActivities");     auth = $true  },
    @{ label = "Listar peticiones";  url = ($BaseUrl + "?action=getRequests");       auth = $true  },
    @{ label = "Mis actividades";    url = ($BaseUrl + "?action=getMyActivities");   auth = $true  }
)

# ---------------------------------------------------------------------------
# Parsear la salida de texto de ab
# ---------------------------------------------------------------------------
function Parse-AbOutput($lines) {
    $m = @{
        rps          = 0.0
        mean         = 0.0
        failed       = 0
        p50          = 0
        p90          = 0
        p95          = 0
        p99          = 0
        max          = 0
        transferRate = 0.0
    }
    foreach ($line in $lines) {
        if ($line -match "Requests per second:\s+([\d.]+)")                { $m.rps          = [double]$Matches[1] }
        if ($line -match "Time per request:\s+([\d.]+) \[ms\] \(mean\)$") { $m.mean         = [double]$Matches[1] }
        if ($line -match "Failed requests:\s+(\d+)")                       { $m.failed       = [int]$Matches[1]   }
        if ($line -match "Transfer rate:\s+([\d.]+)")                      { $m.transferRate = [double]$Matches[1]}
        if ($line -match "^\s+50%\s+(\d+)")  { $m.p50 = [int]$Matches[1] }
        if ($line -match "^\s+90%\s+(\d+)")  { $m.p90 = [int]$Matches[1] }
        if ($line -match "^\s+95%\s+(\d+)")  { $m.p95 = [int]$Matches[1] }
        if ($line -match "^\s+99%\s+(\d+)")  { $m.p99 = [int]$Matches[1] }
        if ($line -match "^\s+100%\s+(\d+)") { $m.max = [int]$Matches[1] }
    }
    return $m
}

# ---------------------------------------------------------------------------
# Color segun tiempo (verde/amarillo/rojo)
# ---------------------------------------------------------------------------
function Get-StatusColor([double]$ms) {
    if ($ms -lt 100) { return "#44b363" }
    if ($ms -lt 500) { return "#d59217" }
    return "#ff3150"
}

# ---------------------------------------------------------------------------
# Ejecutar benchmarks
# ---------------------------------------------------------------------------
$results   = @()
$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm:ss"
$authMode  = if ($SessionCookie) { "Autenticado" } else { "Sin autenticacion (endpoints publicos)" }

Write-Host ""
Write-Host "  MOVEos - Pruebas de rendimiento" -ForegroundColor Cyan
Write-Host "  $Requests peticiones  $Concurrency concurrentes" -ForegroundColor DarkCyan
Write-Host "  Modo: $authMode" -ForegroundColor Yellow
Write-Host ""

foreach ($ep in $endpoints) {
    if ($ep.auth -and (-not $SessionCookie)) { continue }

    Write-Host "  > $($ep.label) ... " -NoNewline

    $abArgs = @("-n", $Requests, "-c", $Concurrency, "-q")
    if ($SessionCookie) { $abArgs += @("-C", $SessionCookie) }
    $abArgs += $ep.url

    $raw = & $ab @abArgs 2>&1
    $m   = Parse-AbOutput $raw

    $results += [PSCustomObject]@{
        Label        = $ep.label
        URL          = $ep.url
        Auth         = $ep.auth
        RPS          = $m.rps
        MeanMs       = $m.mean
        P50Ms        = $m.p50
        P90Ms        = $m.p90
        P95Ms        = $m.p95
        P99Ms        = $m.p99
        MaxMs        = $m.max
        Failed       = $m.failed
        TransferRate = $m.transferRate
    }

    $rpsStr  = [Math]::Round($m.rps, 1)
    $meanStr = [Math]::Round($m.mean, 1)
    $color   = if ($m.mean -lt 100) { "Green" } elseif ($m.mean -lt 500) { "Yellow" } else { "Red" }
    Write-Host "$rpsStr req/s  |  media $meanStr ms  |  p95 $($m.p95) ms" -ForegroundColor $color
}

if ($results.Count -eq 0) {
    Write-Host ""
    Write-Host "  Sin resultados. Para endpoints autenticados:" -ForegroundColor Yellow
    Write-Host "  .\benchmark.ps1 -SessionCookie 'PHPSESSID=<tu-cookie>'" -ForegroundColor White
    exit
}

# ---------------------------------------------------------------------------
# Generar reporte HTML
# ---------------------------------------------------------------------------
$maxRps  = [Math]::Max(1, ($results | Measure-Object -Property RPS   -Maximum).Maximum)
$maxTime = [Math]::Max(1, ($results | Measure-Object -Property P99Ms -Maximum).Maximum)

$totalRps  = [Math]::Round(($results | Measure-Object -Property RPS    -Average).Average, 1)
$avgMean   = [Math]::Round(($results | Measure-Object -Property MeanMs -Average).Average, 1)
$avgP95    = [Math]::Round(($results | Measure-Object -Property P95Ms  -Average).Average, 1)
$totalFail = ($results | Measure-Object -Property Failed -Sum).Sum
$cardFail  = if ([int]$totalFail -eq 0) { "approved" } else { "rejected" }

# --- Filas de tabla ---
$tableRows = ""
foreach ($r in $results) {
    $colorMean = Get-StatusColor $r.MeanMs
    $colorP95  = Get-StatusColor $r.P95Ms
    $colorP99  = Get-StatusColor $r.P99Ms
    $meanFmt   = [Math]::Round($r.MeanMs, 1)

    if ($r.Failed -gt 0) {
        $badge = '<span class="badge fail">' + $r.Failed + ' errores</span>'
    } else {
        $badge = '<span class="badge ok">0</span>'
    }

    $tableRows += "<tr>" +
        "<td class='ep-name'>" + $r.Label + "</td>" +
        "<td style='color:" + $colorMean + ";font-weight:600'>" + $meanFmt + " ms</td>" +
        "<td>" + $r.P50Ms + " ms</td>" +
        "<td>" + $r.P90Ms + " ms</td>" +
        "<td style='color:" + $colorP95 + ";font-weight:600'>" + $r.P95Ms + " ms</td>" +
        "<td style='color:" + $colorP99 + ";font-weight:600'>" + $r.P99Ms + " ms</td>" +
        "<td>" + $r.MaxMs + " ms</td>" +
        "<td>" + $badge + "</td>" +
        "</tr>`n"
}

# --- Barras req/s ---
$rpsRows = ""
foreach ($r in $results) {
    $pct      = [int](($r.RPS / $maxRps) * 100)
    $barColor = if ($r.RPS -ge ($maxRps * 0.7)) { "#44b363" } elseif ($r.RPS -ge ($maxRps * 0.4)) { "#d59217" } else { "#ff3150" }
    $rpsVal   = [Math]::Round($r.RPS, 1)
    $rpsRows += "<div class='bar-row'>" +
        "<span class='bar-label'>" + $r.Label + "</span>" +
        "<div class='bar-track'><div class='bar-fill' style='width:" + $pct + "%;background:" + $barColor + "'></div></div>" +
        "<span class='bar-value'>" + $rpsVal + " req/s</span>" +
        "</div>`n"
}

# --- Barras p95 ---
$timeRows = ""
foreach ($r in $results) {
    $pct      = [int](($r.P95Ms / $maxTime) * 100)
    $barColor = Get-StatusColor $r.P95Ms
    $timeRows += "<div class='bar-row'>" +
        "<span class='bar-label'>" + $r.Label + "</span>" +
        "<div class='bar-track'><div class='bar-fill' style='width:" + $pct + "%;background:" + $barColor + "'></div></div>" +
        "<span class='bar-value'>" + $r.P95Ms + " ms</span>" +
        "</div>`n"
}

# ---------------------------------------------------------------------------
# HTML completo
# ---------------------------------------------------------------------------
$html = '<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MOVEos - Reporte de Rendimiento</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
/* Variables del proyecto — modo claro por defecto */
:root {
  --bg-main:       #ffffff;
  --bg-surface:    #fef8f8;
  --bg-muted:      #f3e9ea;
  --text-primary:  #333333;
  --text-secondary:#666666;
  --brand-primary: #6c2d3a;
  --brand-dark:    #3f0f1a;
  --border-color:  #e0e0e0;
  --c-green:       #44b363;
  --c-green-rgb:   68,179,99;
  --c-yellow:      #d59217;
  --c-yellow-rgb:  213,146,23;
  --c-red:         #ff3150;
  --c-red-rgb:     255,49,80;
  --c-purple:      #6a1d41;
  --c-purple-rgb:  106,29,65;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-main:       #1a1214;
    --bg-surface:    #2a1b1e;
    --bg-muted:      #341f23;
    --text-primary:  #f0f0f0;
    --text-secondary:#b8a5a8;
    --brand-primary: #c87b7f;
    --brand-dark:    #99595c;
    --border-color:  #382527;
    --c-green:       #06d970;
    --c-green-rgb:   6,217,112;
    --c-yellow:      #dcb403;
    --c-yellow-rgb:  220,180,3;
    --c-red:         #d95659;
    --c-red-rgb:     217,86,89;
    --c-purple:      #d08084;
    --c-purple-rgb:  208,128,132;
  }
}

*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Inter",Arial,sans-serif;background:var(--bg-main);color:var(--text-primary);min-height:100vh;line-height:1.6}

/* ---- Top header (misma estructura que el proyecto) ---- */
.top-header{
  display:flex;flex-direction:column;
  background:var(--bg-surface);
  border-bottom:1px solid var(--border-color);
  padding:1rem 3rem;
}
.top-nav{display:flex;justify-content:space-between;align-items:center;gap:1rem}
.logo{display:flex;align-items:center;gap:0.5rem;text-decoration:none}
.logo-text{font-size:1.3rem;font-weight:700;color:var(--brand-primary)}
.nav-badge{font-size:0.78rem;color:var(--text-secondary);font-weight:500;padding:0.25rem 0.75rem;background:var(--bg-muted);border-radius:20px;border:1px solid var(--border-color)}

/* ---- Breadcrumb / meta bar ---- */
.meta-bar{background:var(--bg-muted);border-bottom:1px solid var(--border-color);padding:0.5rem 3rem;display:flex;gap:2rem;font-size:0.82rem;color:var(--text-secondary);flex-wrap:wrap}
.meta-bar strong{color:var(--text-primary)}

/* ---- Contenido central ---- */
.container{padding:2rem 3rem;max-width:1200px;margin:0 auto}

/* ---- Inner header (como _control.scss .header) ---- */
.page-header{display:flex;align-items:center;gap:15px;padding-bottom:1.5rem;border-bottom:1px solid var(--border-color);margin-bottom:1.5rem}
.header-icon{background:var(--bg-muted);padding:15px;border-radius:50%;color:var(--brand-primary);font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.header-content h1{font-size:1.6rem;font-weight:700;margin:0}
.header-content p{font-size:0.875rem;color:var(--text-secondary);margin:0}

/* ---- Stats (igual que _control.scss) ---- */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:2rem}
.card{background:var(--bg-surface);border:1px solid var(--border-color);padding:20px;border-radius:14px;position:relative}
.card h2{font-size:2rem;font-weight:700;margin-bottom:4px}
.card p{font-weight:600}
.card small{color:var(--text-secondary)}
.card .icon{position:absolute;top:15px;right:15px;font-size:18px}
.approved{border:2px solid var(--c-green);background:rgba(var(--c-green-rgb),0.12)}
.approved .icon,.approved h2{color:var(--c-green)}
.pending{border:2px solid var(--c-yellow);background:rgba(var(--c-yellow-rgb),0.12)}
.pending .icon,.pending h2{color:var(--c-yellow)}
.rejected{border:2px solid var(--c-red);background:rgba(var(--c-red-rgb),0.12)}
.rejected .icon,.rejected h2{color:var(--c-red)}
.total{border:2px solid var(--c-purple);background:rgba(var(--c-purple-rgb),0.12)}
.total .icon,.total h2{color:var(--c-purple)}

/* ---- Leyenda ---- */
.legend{display:flex;gap:1.5rem;font-size:0.8rem;color:var(--text-secondary);margin-bottom:1.5rem;flex-wrap:wrap;align-items:center}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:0.3rem;vertical-align:middle;flex-shrink:0}

/* ---- Seccion titulo (como tag .section-title) ---- */
.section-title{font-size:0.8rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border-color)}

/* ---- Grid de graficas ---- */
.charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem}
@media(max-width:768px){.charts-grid{grid-template-columns:1fr}.container{padding:1.25rem 1rem}.meta-bar{padding:0.5rem 1rem}.top-header{padding:1rem}}
.chart-box{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:14px;padding:1.5rem}
.chart-title{font-size:0.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:1.25rem}
.bar-row{display:flex;align-items:center;gap:0.75rem;margin-bottom:0.9rem}
.bar-label{width:150px;font-size:0.76rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}
.bar-track{flex:1;height:10px;background:var(--bg-muted);border-radius:99px;overflow:hidden;border:1px solid var(--border-color)}
.bar-fill{height:100%;border-radius:99px;transition:width 0.4s ease}
.bar-value{width:80px;font-size:0.76rem;font-weight:600;color:var(--text-primary);text-align:right;flex-shrink:0}

/* ---- Tabla ---- */
.table-wrap{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:14px;overflow:hidden;margin-bottom:2rem}
.table-wrap table{width:100%;border-collapse:collapse;font-size:0.875rem}
.table-wrap thead{background:var(--bg-muted)}
.table-wrap th{padding:0.85rem 1rem;text-align:left;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary)}
.table-wrap td{padding:0.85rem 1rem;border-top:1px solid var(--border-color)}
.table-wrap tr:hover td{background:var(--bg-muted)}
.ep-name{font-weight:600;color:var(--text-primary)}
.badge{font-size:0.7rem;font-weight:600;padding:0.2rem 0.6rem;border-radius:12px}
.badge.ok{background:rgba(var(--c-green-rgb),0.15);color:var(--c-green)}
.badge.fail{background:rgba(var(--c-red-rgb),0.15);color:var(--c-red)}

/* ---- Footer ---- */
footer{text-align:center;padding:1.25rem;font-size:0.75rem;color:var(--text-secondary);border-top:1px solid var(--border-color);background:var(--bg-surface)}
</style>
</head>
<body>

<!-- Header (misma estructura visual que el proyecto) -->
<div class="top-header">
  <div class="top-nav">
    <div class="logo">
      <span class="logo-text">MOVEos</span>
    </div>
    <span class="nav-badge">&#9889; Reporte de Rendimiento</span>
    <span style="font-size:0.8rem;color:var(--text-secondary)">TIMESTAMP_PLACEHOLDER</span>
  </div>
</div>

<!-- Barra de meta / configuracion -->
<div class="meta-bar">
  <span><strong>Peticiones/endpoint:</strong> REQUESTS_PLACEHOLDER</span>
  <span><strong>Concurrencia:</strong> CONCURRENCY_PLACEHOLDER usuarios simultaneos</span>
  <span><strong>Endpoints probados:</strong> COUNT_PLACEHOLDER</span>
  <span><strong>Modo:</strong> AUTHMODE_PLACEHOLDER</span>
  <span><strong>Herramienta:</strong> Apache Benchmark (XAMPP)</span>
</div>

<div class="container">

  <!-- Inner header (estilo panel administrador) -->
  <div class="page-header">
    <div class="header-icon">&#9889;</div>
    <div class="header-content">
      <h1>Resultados de Rendimiento HTTP</h1>
      <p>Generado el TIMESTAMP_PLACEHOLDER con Apache Benchmark</p>
    </div>
  </div>

  <!-- Cards de estadisticas (mismas clases que el panel de control) -->
  <div class="stats">
    <div class="card approved">
      <span class="icon">&#9654;</span>
      <h2>TOTALRPS_PLACEHOLDER</h2>
      <p>req/s promedio</p>
      <small>Mayor es mejor</small>
    </div>
    <div class="card pending">
      <span class="icon">&#8987;</span>
      <h2>AVGMEAN_PLACEHOLDER ms</h2>
      <p>Tiempo medio</p>
      <small>Por peticion</small>
    </div>
    <div class="card total">
      <span class="icon">&#128202;</span>
      <h2>AVGP95_PLACEHOLDER ms</h2>
      <p>Percentil 95 (media)</p>
      <small>95% mas rapido que esto</small>
    </div>
    <div class="card CARDFAIL_PLACEHOLDER">
      <span class="icon">&#9888;</span>
      <h2>TOTALFAIL_PLACEHOLDER</h2>
      <p>Peticiones fallidas</p>
      <small>Objetivo: 0</small>
    </div>
  </div>

  <!-- Leyenda de colores -->
  <div class="legend">
    <span><span class="dot" style="background:#44b363"></span>Rapido (menos de 100 ms)</span>
    <span><span class="dot" style="background:#d59217"></span>Aceptable (100-500 ms)</span>
    <span><span class="dot" style="background:#ff3150"></span>Lento (mas de 500 ms)</span>
  </div>

  <!-- Graficas de barras -->
  <p class="section-title">Graficas comparativas</p>
  <div class="charts-grid">
    <div class="chart-box">
      <div class="chart-title">&#9654; Peticiones por segundo &mdash; mayor es mejor</div>
      RPSROWS_PLACEHOLDER
    </div>
    <div class="chart-box">
      <div class="chart-title">&#8987; Tiempo de respuesta p95 &mdash; menor es mejor</div>
      TIMEROWS_PLACEHOLDER
    </div>
  </div>

  <!-- Tabla detalle -->
  <p class="section-title">Detalle por endpoint</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Endpoint</th><th>Media</th><th>p50</th><th>p90</th><th>p95</th><th>p99</th><th>Maximo</th><th>Errores</th>
        </tr>
      </thead>
      <tbody>TABLEROWS_PLACEHOLDER</tbody>
    </table>
  </div>

  <!-- Glosario -->
  <p class="section-title">Glosario de metricas</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Metrica</th><th>Que significa</th><th>Objetivo recomendado</th></tr></thead>
      <tbody>
        <tr><td class="ep-name">req/s</td><td>Peticiones por segundo que el servidor puede atender</td><td>Mas de 50 req/s</td></tr>
        <tr><td class="ep-name">Media</td><td>Tiempo medio de respuesta por peticion</td><td>Menos de 200 ms</td></tr>
        <tr><td class="ep-name">p50</td><td>El 50% de las peticiones fue mas rapido que este valor</td><td>Menos de 150 ms</td></tr>
        <tr><td class="ep-name">p95</td><td>El 95% de las peticiones fue mas rapido que este valor</td><td>Menos de 500 ms</td></tr>
        <tr><td class="ep-name">p99</td><td>El 99% de las peticiones fue mas rapido que este valor</td><td>Menos de 1000 ms</td></tr>
        <tr><td class="ep-name">Maximo</td><td>Peticion mas lenta registrada</td><td>Referencia</td></tr>
        <tr><td class="ep-name">Errores</td><td>Peticiones que devolvieron codigo de error HTTP</td><td>0</td></tr>
      </tbody>
    </table>
  </div>

</div><!-- /container -->

<footer>Proyecto Final MOVEos &mdash; Grupo 5 &mdash; Generado con Apache Benchmark TIMESTAMP_PLACEHOLDER</footer>
</body>
</html>'

$html = $html `
    -replace "TIMESTAMP_PLACEHOLDER",  $timestamp `
    -replace "AUTHMODE_PLACEHOLDER",   $authMode `
    -replace "REQUESTS_PLACEHOLDER",   $Requests `
    -replace "CONCURRENCY_PLACEHOLDER",$Concurrency `
    -replace "COUNT_PLACEHOLDER",      $results.Count `
    -replace "TOTALRPS_PLACEHOLDER",   $totalRps `
    -replace "AVGMEAN_PLACEHOLDER",    $avgMean `
    -replace "AVGP95_PLACEHOLDER",     $avgP95 `
    -replace "TOTALFAIL_PLACEHOLDER",  $totalFail `
    -replace "CARDFAIL_PLACEHOLDER",   $cardFail `
    -replace "RPSROWS_PLACEHOLDER",    $rpsRows `
    -replace "TIMEROWS_PLACEHOLDER",   $timeRows `
    -replace "TABLEROWS_PLACEHOLDER",  $tableRows

$reportPath = Join-Path $outputDir "report.html"
[System.IO.File]::WriteAllText($reportPath, $html, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "  Reporte generado: $reportPath" -ForegroundColor Green
Write-Host "  Abriendo en el navegador..." -ForegroundColor Cyan
Start-Process $reportPath
