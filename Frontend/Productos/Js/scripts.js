document.addEventListener('DOMContentLoaded', async () => {
  try {
      const response = await fetch('http://localhost:3000/productos');  // Solicitud GET para obtener los productos
      const productos = await response.json();  // Respuesta en formato JSON

      const productosList = document.getElementById('productos-list');

      if (productos.length === 0) {
          productosList.innerHTML = '<p>No hay productos disponibles.</p>';
          return;
      }

      // Genera el HTML para cada producto
      productos.forEach(producto => {
          const productoDiv = document.createElement('div');
          productoDiv.classList.add('producto');

          // URL dinámica de la imagen según el nombre del archivo almacenado en la base de datos
          const imagenUrl = `http://localhost:3000/uploads/${producto.imagen}`;

          productoDiv.innerHTML = `
              <img src="${imagenUrl}" alt="${producto.nombre}" />
              <h3>${producto.nombre}</h3>
              <p>${producto.descripcion}</p>
              <p>Precio: $${producto.precio}</p>
              <p>Categoría: ${producto.categoria}</p>
              <p>Stock: ${producto.cantidad_stock}</p>
          `;

          productosList.appendChild(productoDiv);
      });
  } catch (error) {
      console.error('Error al cargar los productos:', error);
      const productosList = document.getElementById('productos-list');
      productosList.innerHTML = '<p>Error al cargar los productos. Intenta de nuevo más tarde.</p>';
  }
});