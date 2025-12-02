

    <?php 

    session_start();

    if(isset($_POST['login'])){
        if(!empty($_POST['username']) and !empty($_POST['password'])){
            
            $username = $_POST['username'];
            $pass = $_POST['password'];
            
            try{
                
                $bd = new PDO('mysql:host=localhost;dbname=moveos;charset=utf8', 'root', '');
                $login = $bd->prepare('SELECT * FROM users WHERE username = ?');
                $login->execute([$username]);

                $datos = $login->fetch();
                $pass_bd = $datos['password_hash'];
                $password_verify = password_verify($pass,$pass_bd);
                $role_id =  $datos['role_id'];

                $consulta_rol = $bd->prepare('SELECT name FROM roles WHERE id = ?');
                $consulta_rol->execute([$role_id]);

                $datos_rol = $consulta_rol->fetch();

                $name_rol = $datos_rol['name'];

                if($login->rowCount() == 1 and $password_verify){
                    $_SESSION['username'] = $username;
                    $_SESSION['rol'] = $name_rol;
                    header("Location: ../views/home.php");
                }
                

                
            }catch(Exception $e){
                die($e->getMessage());
            }
        }
    }




?>