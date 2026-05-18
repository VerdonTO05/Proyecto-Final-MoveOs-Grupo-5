# Pruebas Unitarias — MOVEos

Documentación del sistema de pruebas automatizadas del proyecto MOVEos.

---

## 1. ¿Qué son las pruebas unitarias?

Una **prueba unitaria** es un fragmento de código que ejecuta automáticamente una parte de la aplicación y comprueba que se comporta como esperamos. Cada prueba sigue tres fases:

1. **Preparar** (Arrange) — montar los datos y el estado necesarios.
2. **Actuar** (Act) — llamar al método que queremos probar.
3. **Comprobar** (Assert) — verificar que el resultado coincide con lo esperado.

Si todas las comprobaciones se cumplen, la prueba pasa (✔). Si alguna falla, la prueba se marca como fallida (✘) e indica exactamente qué línea no cumplió la condición.

En este proyecto usamos **PHPUnit 9**, el framework de pruebas estándar de PHP.

---

## 2. Estructura de las pruebas en MOVEos

Todas las pruebas viven en la carpeta [tests/](tests/). Hay **tres tipos** de pruebas, con propósitos distintos:

### Tipo A — Pruebas con mocks (unitarias puras)

| Archivo | Qué prueba |
|---|---|
| [tests/UserMockTest.php](tests/UserMockTest.php) | Lógica de la clase `User` aislada de la base de datos |

- **No necesitan MySQL ni XAMPP arrancado.**
- Sustituyen `PDO` por un "doble" (mock) controlado por PHPUnit.
- Ejecución en milisegundos.
- Útiles para probar **ramas de error** que serían difíciles de provocar con BD real (excepciones, casos límite).

### Tipo B — Pruebas de integración (con base de datos real)

| Archivo | Qué prueba |
|---|---|
| [tests/LoginTest.php](tests/LoginTest.php) | Inicio de sesión de usuario |
| [tests/RegisterTest.php](tests/RegisterTest.php) | Registro de nuevos usuarios |
| [tests/EditInfoTest.php](tests/EditInfoTest.php) | Edición de perfil de usuario |
| [tests/ActivityRequestTest.php](tests/ActivityRequestTest.php) | Creación de actividades y peticiones |
| [tests/SecurityTest.php](tests/SecurityTest.php) | Seguridad: inyección SQL, hashing de contraseñas, entradas extremas |

- **Necesitan XAMPP arrancado** (Apache + MySQL).
- Necesitan la BD `moveos_test` con la estructura del proyecto.
- Verifican que el SQL real, los triggers y los procedimientos almacenados funcionan correctamente.
- Cada prueba limpia la BD antes de ejecutarse para garantizar aislamiento.

### Tipo C — Pruebas de rendimiento (Apache Benchmark)

| Archivo | Qué hace |
|---|---|
| [benchmark.ps1](benchmark.ps1) | Mide el rendimiento HTTP con Apache Benchmark |
| [tests/performance/report.html](tests/performance/report.html) | Informe HTML generado con gráficos y percentiles |

- **Necesitan XAMPP arrancado** (Apache + MySQL) y la aplicación accesible en `localhost`.
- Prueban 6 endpoints (3 públicos + 3 autenticados) con carga configurable.
- Generan un informe visual con tarjetas de resumen, gráfico de barras y tabla de percentiles.
- Se ejecutan desde PowerShell (ver sección 6).

### Vista interactiva web

| Archivo | Qué hace |
|---|---|
| [tests/runner.php](tests/runner.php) | Panel web para lanzar y ver los resultados de forma interactiva |

Accesible en: `http://localhost/xampp/Proyecto-Final-MoveOs-Grupo-5/root-proyect/tests/runner.php`

- Permite ejecutar cualquier suite o todas a la vez con un clic.
- Muestra los resultados con colores (verde/rojo) en tiempo real.
- Incluye un formulario para lanzar Apache Benchmark desde el navegador.
- Solo es accesible desde `localhost` por seguridad.

---

## 3. Requisitos previos

Antes de poder ejecutar las pruebas, necesitas:

1. **PHP 8.0+** (incluido en XAMPP).
2. **Composer** instalado (https://getcomposer.org/).
3. **MySQL/MariaDB** arrancado (desde el panel de control de XAMPP) — solo para pruebas de integración.
4. **Base de datos `moveos_test`** creada y con la estructura del proyecto (ver sección 5).

---

## 4. Instalación de PHPUnit

Desde la carpeta `root-proyect/`:

```powershell
composer install --ignore-platform-req=php
```

Si Composer no se reconoce en PowerShell, comprueba que está en el PATH del sistema, o usa la ruta completa de la instalación.

> **Nota:** Se usa `--ignore-platform-req=php` porque algunas dependencias del proyecto (PhpDocumentor) requieren PHP 8.1+, mientras que XAMPP en este equipo trae PHP 8.0.30. PHPUnit 9 sí funciona con PHP 8.0; solo se ignora el requisito de las dependencias que no se ejecutan en tiempo de pruebas.

Esto creará la carpeta `vendor/` con PHPUnit y sus dependencias.

---

## 5. Preparar la base de datos de pruebas

Las pruebas de integración usan una BD aparte llamada `moveos_test` para no interferir con los datos reales de `moveos`.

### Paso 1 — Crear la base de datos vacía

```powershell
& C:\xampp\mysql\bin\mysql.exe -uroot -e "CREATE DATABASE IF NOT EXISTS moveos_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Paso 2 — Copiar la estructura desde `moveos`

```powershell
& C:\xampp\mysql\bin\mysqldump.exe -uroot --no-data --routines --triggers --events moveos | & C:\xampp\mysql\bin\mysql.exe -uroot moveos_test
```

Esto copia **solo la estructura** (tablas, triggers, procedimientos, eventos) sin datos. Los tests insertan sus propios datos en su método `setUp()`.

### Paso 3 — Precargar las categorías

`ActivityRequestTest` usa `category_id => 1` y `=> 2`, pero **no crea las categorías** en su `setUp`. Hay que precargarlas:

```powershell
& C:\xampp\mysql\bin\mysqldump.exe -uroot --no-create-info moveos categories | & C:\xampp\mysql\bin\mysql.exe -uroot moveos_test
```

### Verificación

```powershell
& C:\xampp\mysql\bin\mysql.exe -uroot moveos_test -e "SHOW TABLES; SELECT COUNT(*) AS total_categorias FROM categories;"
```

Deberías ver 10 tablas y 11 categorías.

---

## 6. Ejecutar las pruebas

### Opción A — Vista web interactiva (recomendada)

Abre en el navegador:

```
http://localhost/xampp/Proyecto-Final-MoveOs-Grupo-5/root-proyect/tests/runner.php
```

Desde ahí puedes lanzar cualquier suite, ver los resultados con colores y ejecutar Apache Benchmark con un formulario, todo sin tocar la terminal.

### Opción B — Terminal (PowerShell)

PowerShell por defecto no tiene `php` en el PATH, pero el archivo `vendor\bin\phpunit.bat` lo necesita. Añade XAMPP al PATH de la sesión:

```powershell
$env:Path += ';C:\xampp\php'
```

Para hacerlo permanente, añade `C:\xampp\php` a las variables de entorno del sistema (`sysdm.cpl` → Opciones avanzadas → Variables de entorno).

Desde la carpeta `root-proyect/`:

```powershell
# Toda la suite con formato legible (Spanish)
.\vendor\bin\phpunit.bat --testdox

# Solo las pruebas con mocks (no necesitan MySQL)
.\vendor\bin\phpunit.bat tests\UserMockTest.php --testdox

# Solo las pruebas de seguridad
.\vendor\bin\phpunit.bat tests\SecurityTest.php --testdox

# Solo un test concreto (filtra por nombre de método)
.\vendor\bin\phpunit.bat --filter testLoginSuccess tests\LoginTest.php

# Pruebas de rendimiento con Apache Benchmark
.\benchmark.ps1 -Requests 200 -Concurrency 10
```

### Ejemplo de salida PHPUnit

```
Pruebas de seguridad: inyeccion SQL, hashing y entradas maliciosas
 ✔ Inyeccion SQL clasica en username no salta la autenticacion
 ✔ Inyeccion SQL DROP TABLE en username no destruye la tabla
 ✔ La contraseña se almacena hasheada con bcrypt, nunca en texto plano
 ...

Time: 00:02.489, Memory: 6.00 MB

OK (34 tests, 80 assertions)
```

---

## 7. Cómo funcionan los tests por dentro

### 7.1. Pruebas de integración (Tipo B)

Todas siguen el mismo patrón:

```php
class LoginTest extends TestCase
{
    private $pdo;
    private $userModel;

    protected function setUp(): void
    {
        // 1. Conexión a la BD de pruebas
        $this->pdo = new PDO('mysql:host=localhost;dbname=moveos_test', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 2. Limpiar tablas para garantizar aislamiento entre tests
        $this->pdo->exec("DELETE FROM users");
        $this->pdo->exec("DELETE FROM roles");

        // 3. Preparar datos mínimos
        $this->pdo->exec("INSERT INTO roles (id, name) VALUES (1, 'participante')");

        // 4. Instanciar el modelo bajo prueba
        $this->userModel = new User($this->pdo);
    }

    public function testLoginSuccess()
    {
        $this->createTestUser();                                  // Arrange
        $user = $this->userModel->loginByUsername('iperez', '12345678');  // Act
        $this->assertNotFalse($user);                             // Assert
        $this->assertEquals('iperez', $user['username']);
    }
}
```

El método `setUp()` se ejecuta **antes de cada test**, asegurando que cada prueba arranca desde un estado conocido.

### 7.2. Pruebas con mocks (Tipo A)

Los mocks sustituyen `PDO` y `PDOStatement` por dobles falsos que devuelven lo que decimos:

```php
public function testLoginSuccessWithCorrectPassword()
{
    $hash = password_hash('12345678', PASSWORD_DEFAULT);

    // 1. Mock del PDOStatement
    $stmtMock = $this->createMock(PDOStatement::class);
    $stmtMock->method('execute')->willReturn(true);
    $stmtMock->method('fetch')->willReturn([
        'id' => 1,
        'username' => 'iperez',
        'password_hash' => $hash,
        'role_name' => 'participante'
    ]);

    // 2. Mock del PDO
    $pdoMock = $this->createMock(PDO::class);
    $pdoMock->method('prepare')->willReturn($stmtMock);

    // 3. Inyectar el mock y ejecutar
    $userModel = new User($pdoMock);
    $result = $userModel->loginByUsername('iperez', '12345678');

    $this->assertNotFalse($result);
}
```

**Ventajas de los mocks:**
- Ultrarrápidos (sub-milisegundo).
- No requieren MySQL.
- Permiten simular casos imposibles de provocar con BD real (excepciones de conexión, etc.).

**Inconvenientes:**
- No prueban que el SQL sea válido (lo prueba el mock, no MySQL).
- No prueban triggers ni procedimientos almacenados.

Por eso conviene tener **ambos tipos** de pruebas: los mocks cubren la lógica de control y los casos de error; los tests de integración verifican que el SQL y la BD real se comportan correctamente.

---

## 8. Cobertura actual

### PHPUnit

| Módulo | Tests con mocks | Tests de integración |
|---|---|---|
| Login | 3 | 3 |
| Registro | — | 3 |
| Edición de perfil | 3 (parcial) | 2 |
| Actividades / Peticiones | — | 2 |
| Seguridad (SQL injection, hashing, XSS) | — | 15 |
| Inscripciones | — | — |
| Chat | — | — |
| **Total** | **6** | **25** |

**Total PHPUnit: 34 tests, ~80 aserciones.**

### Apache Benchmark

| Endpoint | Tipo | Métrica medida |
|---|---|---|
| Página principal (`/`) | Público | RPS, latencia media, P95, P99 |
| Vista de login | Público | RPS, latencia media, P95, P99 |
| Vista de registro | Público | RPS, latencia media, P95, P99 |
| `getActivities` | Autenticado | RPS, latencia media, P95, P99 |
| `getRequests` | Autenticado | RPS, latencia media, P95, P99 |
| `getMyActivities` | Autenticado | RPS, latencia media, P95, P99 |

El script genera automáticamente un informe HTML en [tests/performance/report.html](tests/performance/report.html).

### Áreas con cobertura pendiente

- Lógica de inscripciones (`Registration::createRegistration` — ramas: `already_registered`, `activity_full`, conflictos de fecha).
- Aceptación/rechazo de peticiones (`Request::acceptRequest`).
- Aprobación/rechazo de actividades por parte del administrador.
- Procedimiento `deactivate_user` (cascadas y SET NULL).

---

## 9. Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `Could not open input file: .\vendor\bin\phpunit` | Se intenta ejecutar el script sin extensión | Usar `.\vendor\bin\phpunit.bat` (con `.bat`) |
| Se abre el código de PHPUnit en el editor | Windows no asocia el archivo a PHP | Usar el `.bat` o invocar `php.exe .\vendor\bin\phpunit` |
| `"php" no se reconoce` | XAMPP no está en el PATH | Ejecutar `$env:Path += ';C:\xampp\php'` antes |
| `SQLSTATE[HY000] [1049] Unknown database 'moveos_test'` | Falta crear la BD de pruebas | Seguir la sección 5 |
| `SQLSTATE[HY000] [2002]` | MySQL no está arrancado | Iniciar MySQL desde el panel de XAMPP |
| `Foreign key constraint fails` en `ActivityRequestTest` | Faltan categorías en `moveos_test` | Ejecutar el `mysqldump` de la sección 5 paso 3 |
| `composer no se reconoce` | Composer no instalado o fuera del PATH | Reinstalar Composer o cerrar y abrir PowerShell |
| `syntax error, unexpected identifier "SERIALIZATION_FORMAT..."` | `doctrine/instantiator 2.x` usa PHP 8.3+ | Ya está bloqueado a `1.5.*` en `composer.json` |

---

## 10. Añadir nuevas pruebas

Para crear un test nuevo:

1. Crea un archivo `tests/NombreDelTest.php` que extienda `PHPUnit\Framework\TestCase`.
2. Sigue las convenciones de nombrado: clases acabadas en `Test`, métodos empezando por `test`.
3. Añade una anotación `@testdox` en español encima de cada método para que la salida quede legible.
4. Si necesitas BD, sigue el patrón de `LoginTest.php` (conexión, limpieza, datos mínimos).
5. Si quieres aislar de la BD, usa mocks como `UserMockTest.php`.

Ejemplo mínimo:

```php
<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/models/entities/User.php';

/**
 * @testdox Pruebas de mi nuevo módulo
 */
class MiNuevoTest extends TestCase
{
    /**
     * @testdox Algo funciona como esperamos
     */
    public function testAlgoBasico()
    {
        $this->assertTrue(true);
    }
}
```

---

## 11. Referencias

- Documentación oficial de PHPUnit: https://docs.phpunit.de/en/9.6/
- Mocking en PHPUnit: https://docs.phpunit.de/en/9.6/test-doubles.html
- Composer: https://getcomposer.org/doc/
