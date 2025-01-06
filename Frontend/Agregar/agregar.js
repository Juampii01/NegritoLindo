document.getElementById('agregar-producto-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

  const formData = new FormData(e.target); // Obtener todos los datos del formulario

  try {
    // Enviar el formulario como FormData al backend
    const response = await fetch('http://localhost:3000/productos', {
      method: 'POST',
      body: formData, // Enviar el formulario como FormData
    });

    // Convertir la respuesta en JSON
    const result = await response.json();

    // Si la respuesta es exitosa, mostrar mensaje y resetear el formulario
    if (response.ok) {
      document.getElementById('mensaje').textContent = 'Producto agregado exitosamente';
      document.getElementById('agregar-producto-form').reset(); // Resetear el formulario

      // Aquí se agrega el producto al frontend
      const producto = result.producto;  // Asumimos que el backend devuelve el producto agregado
      const productoElemento = document.createElement('div');
      productoElemento.classList.add('product-item');

      const imagen = document.createElement('img');
      imagen.src = producto.imagen;  // Asegúrate que el backend devuelve la URL de la imagen
      imagen.alt = producto.nombre;

      // Ajustar el tamaño de la imagen
      imagen.style.width = '100%';
      imagen.style.height = '180px';
      imagen.style.objectFit = 'cover'; // Mantener la proporción de la imagen

      productoElemento.appendChild(imagen);

      // Aquí puedes agregar más detalles del producto como el nombre y precio
      const nombre = document.createElement('h3');
      nombre.textContent = producto.nombre;
      productoElemento.appendChild(nombre);

      // Añadir el nuevo producto a la lista de productos
      document.querySelector('#productos').appendChild(productoElemento);
    } else {
      // Si la respuesta tiene error, mostrar el mensaje de error
      document.getElementById('mensaje').textContent = 'Error al agregar el producto: ' + result.error;
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error al agregar producto:', error);
    document.getElementById('mensaje').textContent = 'Error al agregar el producto. Intenta de nuevo más tarde.';
  }
});
