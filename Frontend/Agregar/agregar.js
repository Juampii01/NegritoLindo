// Función para manejar el formulario de agregar producto
document.getElementById('agregar-producto-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  try {
    const response = await fetch('http://localhost:3000/productos', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (response.ok) {
      document.getElementById('mensaje').textContent = 'Producto agregado exitosamente';
      document.getElementById('mensaje').style.color = 'green';
      document.getElementById('agregar-producto-form').reset();
      // Recargar productos tras agregar uno nuevo
      cargarProductos();
    } else {
      document.getElementById('mensaje').textContent = 'Error al agregar el producto: ' + result.error;
      document.getElementById('mensaje').style.color = 'red';
    }
  } catch (error) {
    console.error('Error al agregar producto:', error);
    document.getElementById('mensaje').textContent = 'Error al agregar el producto. Intenta de nuevo más tarde.';
    document.getElementById('mensaje').style.color = 'red';
  }
});

// Cargar los productos al cargar la página o después de agregar un producto
async function cargarProductos() {
  try {
    const response = await fetch('http://localhost:3000/productos');
    const productos = await response.json();

    const productosList = document.getElementById('productos-list');
    productosList.innerHTML = '';  // Limpiar la lista de productos

    if (productos.length === 0) {
      productosList.innerHTML = '<p>No hay productos disponibles.</p>';
      return;
    }

    // Contador para los productos destacados
    let productosDestacados = productos.filter(producto => producto.destacado === 1).length;

    // Generar el HTML para cada producto
    productos.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('producto');

      // URL dinámica de la imagen según el nombre del archivo almacenado en la base de datos
      const imagenUrl = `http://localhost:3000/uploads/${producto.imagen}`;

      // Verificar si el producto está destacado y definir el valor del checkbox
      const checked = producto.destacado === 1 ? 'checked' : ''; // Marcar el checkbox si está destacado

      // Agregar el HTML del producto, incluyendo el checkbox y el botón de eliminar
      productoDiv.innerHTML = `
        <img src="${imagenUrl}" alt="${producto.nombre}" />
        <h3>${producto.nombre}</h3>
        <label>
            <input type="checkbox" class="checkbox-destacado" ${checked} data-id="${producto.id}" ${producto.destacado === 1 && productosDestacados >= 4 ? 'disabled' : ''}> Destacado
        </label>
        <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
      `;

      // Añadir el producto a la lista de productos
      productosList.appendChild(productoDiv);

      // Agregar el manejador de evento para eliminar producto
      const eliminarBtn = productoDiv.querySelector('.eliminar-producto');
      eliminarBtn.addEventListener('click', async () => {
        try {
          const response = await fetch(`http://localhost:3000/productos/${producto.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            // Eliminar el producto de la interfaz
            productoDiv.remove();
            alert('Producto eliminado exitosamente');
          } else {
            const result = await response.json();
            alert('Error al eliminar el producto: ' + result.error);
          }
        } catch (error) {
          console.error('Error al eliminar el producto:', error);
          alert('Error al eliminar el producto. Intenta de nuevo más tarde.');
        }
      });
    });

    // Escuchar los cambios en los checkboxes
    document.querySelectorAll('.checkbox-destacado').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const productoId = e.target.getAttribute('data-id');
        const isChecked = e.target.checked;

        // Si el producto está destacado y hay 4 productos ya destacados, no permitir más
        if (isChecked && productosDestacados >= 4) {
          e.target.checked = false;
          return alert('Ya hay 4 productos destacados. No puedes destacar más.');
        }

        try {
          // Realizar una solicitud PUT al backend para actualizar el estado del producto
          const response = await fetch(`http://localhost:3000/productos/${productoId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ destacado: isChecked ? 1 : 0 }),
          });

          if (response.ok) {
            // Si el producto se actualiza correctamente, actualizamos el contador
            productosDestacados = isChecked ? productosDestacados + 1 : productosDestacados - 1;

            // Actualizar la visibilidad de los checkboxes
            document.querySelectorAll('.checkbox-destacado').forEach(cb => {
              const isChecked = cb.checked;
              // Deshabilitar checkboxes si ya hay 4 productos destacados, pero permitir cambios
              if (productosDestacados >= 4 && !isChecked) {
                cb.disabled = true;  // Desactivar los checkboxes no seleccionados
              } else {
                cb.disabled = false;  // Habilitar los checkboxes si no se supera el límite
              }
            });
          } else {
            alert('Error al actualizar el producto.');
          }
        } catch (error) {
          console.error('Error al actualizar el producto:', error);
          alert('Error al actualizar el producto.');
        }
      });
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
    const productosList = document.getElementById('productos-list');
    productosList.innerHTML = '<p>Error al cargar los productos. Intenta de nuevo más tarde.</p>';
  }
}

// Llamar a la función para cargar los productos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarProductos);
