const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Usamos la versión con promesas
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');  // Importar Nodemailer


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crear conexión con mysql2/promise
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'juampi',
    database: 'tienda'
});

// Configuración de Multer para manejo de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ruta para agregar productos
app.post('/productos', upload.single('imagen'), async (req, res) => {
    const { nombre, descripcion, precio, categoria_id, cantidad_stock } = req.body;
    if (!nombre || !descripcion || !precio || !categoria_id || !cantidad_stock) {
        return res.status(400).json({ error: "Faltan datos requeridos." });
    }

    const imagen_nombre = req.file ? req.file.filename : null;
    let errores = [];

    if (!nombre.trim()) errores.push("El nombre es obligatorio.");
    if (!descripcion.trim()) errores.push("La descripción es obligatoria.");
    if (isNaN(precio) || precio <= 0) errores.push("El precio debe ser un número positivo.");
    if (isNaN(categoria_id) || categoria_id <= 0) errores.push("La categoría seleccionada es inválida.");
    if (isNaN(cantidad_stock) || cantidad_stock < 0) errores.push("La cantidad en stock debe ser un número mayor o igual a 0.");

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    try {
        const query = 'INSERT INTO productos (nombre, descripcion, precio, categoria_id, cantidad_stock, imagen) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [nombre, descripcion, precio, categoria_id, cantidad_stock, imagen_nombre];
        const [result] = await db.query(query, values);

        res.status(201).json({
            mensaje: 'Producto agregado exitosamente',
            productoId: result.insertId,
            imagen_nombre: imagen_nombre
        });
    } catch (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).json({ error: 'Error al agregar producto', detalles: err.message });
    }
});

// Ruta para obtener productos
app.get('/productos', async (req, res) => {
    const query = 'SELECT * FROM productos';
    try {
        const [productos] = await db.query(query);
        res.status(200).json(productos);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Ruta para obtener productos destacados
app.get('/productos/destacados', async (req, res) => {
    const query = 'SELECT * FROM productos WHERE destacado = 1 AND mostrar_en_tienda = 1';
    try {
        const [productosDestacados] = await db.query(query);
        res.status(200).json(productosDestacados);
    } catch (err) {
        console.error('Error al obtener productos destacados:', err);
        res.status(500).json({ error: 'Error al obtener productos destacados' });
    }
});

// Ruta para obtener un producto por ID
app.get('/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM productos WHERE id = ?';
        const [productos] = await db.query(query, [id]);

        if (productos.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json(productos[0]);
    } catch (err) {
        console.error('Error al obtener producto:', err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Ruta para eliminar un producto
app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de producto no proporcionado' });
    }

    try {
        const [results] = await db.query('DELETE FROM productos WHERE id = ?', [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        console.log(`Producto con ID ${id} eliminado exitosamente.`);
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// Ruta para actualizar productos
app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { destacado } = req.body; // Estado de destacado (1 o 0)

    if (![0, 1].includes(destacado)) {
        return res.status(400).json({ error: 'El valor de destacado debe ser 1 o 0' });
    }

    try {
        const query = 'UPDATE productos SET destacado = ? WHERE id = ?';
        await db.query(query, [destacado, id]);
        res.status(200).json({ mensaje: 'Producto actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Ruta para crear cuenta de usuario
app.post('/crearCuenta', async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    try {
        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Aquí insertamos los datos en la base de datos
        await db.query('INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)', [nombre, email, hashedPassword]);

        // Respuesta de éxito
        res.json({
            success: true,
            message: 'Cuenta creada exitosamente',
        });
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        res.json({
            success: false,
            message: 'Hubo un error al crear tu cuenta',
        });
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',  // Usamos Gmail como ejemplo, puedes usar otro servicio.
    auth: {
        user: 'tu_correo@gmail.com',  // Tu correo electrónico
        pass: 'tu_contraseña'         // Tu contraseña de Gmail o app password
    }
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
