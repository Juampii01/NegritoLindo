document.addEventListener('DOMContentLoaded', async () => {
    const nombreProducto = document.getElementById('nombre-producto');
    const descripcionProducto = document.getElementById('descripcion-producto');
    const precioProducto = document.getElementById('precio-producto');
    const stockProducto = document.getElementById('stock-producto');
    const imagenProducto = document.getElementById('imagen-producto');
    const errorMessage = document.getElementById('error-message');
    const envio = document.getElementById('envio');

    async function cargarProducto() {
        // Obtener el ID del producto desde la URL
        const params = new URLSearchParams(window.location.search);
        const productoId = params.get('id');

        if (!productoId) {
            errorMessage.innerText = 'ID de producto no proporcionado.';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            // Hacer la solicitud al backend
            const response = await fetch(`http://localhost:3000/productos/${productoId}`);
            if (!response.ok) {
                throw new Error(`Error al obtener producto: ${response.statusText}`);
            }

            const producto = await response.json();

            // Rellenar el DOM con los datos del producto
            nombreProducto.innerText = producto.nombre || 'Nombre no disponible';
            descripcionProducto.innerText = producto.descripcion 
                ? `Descripción: ${producto.descripcion}` 
                : 'Descripción no disponible';
            precioProducto.innerText = producto.precio 
                ? `Precio: $${producto.precio}` 
                : 'Precio no disponible';
            stockProducto.innerText = producto.cantidad_stock 
                ? `Stock disponible: ${producto.cantidad_stock}` 
                : 'Stock no disponible';
            envio.innerText = producto.envio ? producto.envio : 'Envío no disponible';

            if (producto.imagen) {
                imagenProducto.src = `http://localhost:3000/uploads/${producto.imagen}`;
                imagenProducto.style.display = 'block';
            } else {
                imagenProducto.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.innerText = 'Error al cargar el producto. Intenta de nuevo más tarde.';
            errorMessage.style.display = 'block';
        }
    }

    // Mostrar un mensaje mientras se carga el producto
    errorMessage.innerText = 'Cargando...';
    errorMessage.style.display = 'block';

    await cargarProducto();

    // Ocultar el mensaje de carga una vez completado
    errorMessage.style.display = 'none';
});
