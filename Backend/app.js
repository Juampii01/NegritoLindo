// ... otras configuraciones y rutas del backend
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer'); // Para manejo de archivos
const path = require('path');
const cors = require('cors');

// Configuración de la aplicación Express
const app = express();

// Uso de middleware
app.use(cors());  // Asegúrate de aplicar cors después de crear la instancia de app
app.use(bodyParser.json());  // Middleware para convertir el body en JSON

// Configuración para servir archivos estáticos (imágenes) desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para almacenar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegúrate de que la carpeta existe
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath); // Directorio donde se almacenarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para el archivo
    }
});

const upload = multer({ storage: storage });

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'juampi',
    database: 'tienda'
});

// Convertir la conexión a promesas
const promiseDb = db.promise();

// Conectar con la base de datos
db.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});

// Ruta para agregar productos (con manejo de archivo)
app.post('/productos', upload.single('imagen'), async (req, res) => {
    console.log('Archivo recibido:', req.file);  // Verifica si la imagen se recibe correctamente
    console.log('Cuerpo de la solicitud:', req.body);

    const { nombre, descripcion, precio, categoria_id, cantidad_stock } = req.body;

    if (!nombre || !descripcion || !precio || !categoria_id || !cantidad_stock) {
        return res.status(400).json({ error: "Faltan datos requeridos." });
    }

    const imagen_nombre = req.file ? req.file.filename : null;

    let errores = [];

    if (!nombre || nombre.trim() === "") {
        errores.push("El nombre es obligatorio.");
    }

    if (!descripcion || descripcion.trim() === "") {
        errores.push("La descripción es obligatoria.");
    }

    if (isNaN(precio) || precio <= 0) {
        errores.push("El precio debe ser un número positivo.");
    }

    if (isNaN(categoria_id) || categoria_id <= 0) {
        errores.push("La categoría seleccionada es inválida.");
    }

    if (isNaN(cantidad_stock) || cantidad_stock < 0) {
        errores.push("La cantidad en stock debe ser un número mayor o igual a 0.");
    }

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    try {
        const query = 'INSERT INTO productos (nombre, descripcion, precio, categoria_id, cantidad_stock, imagen) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [nombre, descripcion, precio, categoria_id, cantidad_stock, imagen_nombre];
        
        const [result] = await promiseDb.query(query, values);
        
        res.status(201).json({
            mensaje: 'Producto agregado exitosamente',
            productoId: result.insertId,
            imagen_nombre: imagen_nombre  // Devolver el nombre de la imagen
        });
    } catch (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).json({ error: 'Error al agregar producto', detalles: err.message });
    }
});

// Ruta para obtener productos
app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM productos';  // Consulta para obtener todos los productos

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ error: 'Error al obtener productos' });
        }

        res.status(200).json(results);  // Devuelve los productos como respuesta en formato JSON
    });
});

// Configurar el puerto del servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor en el puerto ${port}`);
});
