document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/productos');
        const productos = await response.json();

        const productosList = document.getElementById('productos-list');
        const productosDestacados = productos.filter(producto => producto.destacado === 1);

        if (productosDestacados.length === 0) {
            productosList.innerHTML = '<p>No hay productos destacados disponibles.</p>';
            return;
        }

        productosDestacados.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');

            const imagenUrl = `http://localhost:3000/uploads/${producto.imagen}`;

            productoDiv.innerHTML = `
                <img src="${imagenUrl}" alt="${producto.nombre}" />
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Categoría: ${producto.categoria}</p>
                <p>Stock: ${producto.cantidad_stock}</p>
                <a href="Productos/producto.html?id=${producto.id}" class="ver-producto-btn">Ver Producto</a>
            `;

            productosList.appendChild(productoDiv);
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        const productosList = document.getElementById('productos-list');
        productosList.innerHTML = '<p>Error al cargar los productos. Intenta de nuevo más tarde.</p>';
    }

    // Inicializar Swiper con autoplay y navegación
    new Swiper('.swiper-container', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        effect: 'fade',
    });
});
