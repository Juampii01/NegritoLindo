<?php
// Configuración de la conexión a la base de datos
$host = 'localhost'; // Cambia esto por tu host
$dbname = 'nombre_de_base_de_datos'; // Nombre de tu base de datos
$username = 'usuario'; // Tu usuario de la base de datos
$password = 'contraseña'; // Tu contraseña de la base de datos

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Recuperar los datos del formulario
        $nombre = $_POST['nombre'];
        $descripcion = $_POST['descripcion'];
        $precio = $_POST['precio'];
        $categoria_id = $_POST['categoria_id'];
        $cantidad_stock = $_POST['cantidad_stock'];

        // Manejo de la imagen
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
            $imagen = $_FILES['imagen'];
            $imagen_nombre = $imagen['name'];
            $imagen_tmp = $imagen['tmp_name'];
            $imagen_destino = 'imagenes/' . $imagen_nombre;
            move_uploaded_file($imagen_tmp, $imagen_destino);
        } else {
            $imagen_destino = null;
        }

        // Consulta SQL para insertar el producto
        $sql = "INSERT INTO productos (nombre, descripcion, precio, categoria_id, cantidad_stock, imagen) 
                VALUES (:nombre, :descripcion, :precio, :categoria_id, :cantidad_stock, :imagen)";
        
        $stmt = $pdo->prepare($sql);
        
        // Ejecutar la consulta con los datos del formulario
        $stmt->execute([
            ':nombre' => $nombre,
            ':descripcion' => $descripcion,
            ':precio' => $precio,
            ':categoria_id' => $categoria_id,
            ':cantidad_stock' => $cantidad_stock,
            ':imagen' => $imagen_destino
        ]);

        echo "Producto agregado correctamente.";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
