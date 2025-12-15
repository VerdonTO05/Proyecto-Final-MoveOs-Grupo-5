<?php
class User {
    private $conn;
    private $table_name = 'users';
    public $id;
    public $full_name;
    public $email;
    public $username;
    public $role;
    public $create_at;

    /**
     * Constructor: recibe la conexión a la base de datos
     * @param mixed $db
     */
    public function __construct($db){
        $this->conn = $db;
    }

    public function getUsers(){

    }

    public function getUserById(){

    }

    public function login(){

    }

    public function registerUser(){
         
    }

    public function editUser(){

    }

    public function logoutUser(){

    }  
}
?>