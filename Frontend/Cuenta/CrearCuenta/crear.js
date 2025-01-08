document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-account-form');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío del formulario por defecto
        
        // Recoger los valores del formulario
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const contraseña = document.getElementById('contraseña').value;
        const confirmarContraseña = document.getElementById('confirmar-contraseña').value;

        // Validación básica de contraseñas
        if (contraseña !== confirmarContraseña) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        // Enviar los datos al servidor (backend)
        try {
            const response = await fetch('http://localhost:3000/crearCuenta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, email, contraseña })
            });

            // Asegurarse de que la respuesta sea JSON
            if (!response.ok) {
                throw new Error('Error al conectar con el servidor');
            }

            const result = await response.json();
            console.log('Respuesta del servidor:', result); // Añadir este log para depurar

            // Verificar que result tenga las propiedades correctas
            if (result.success) {
                // Mostrar mensaje de éxito con SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: '¡Cuenta Creada!',
                    text: result.message || 'La cuenta fue creada correctamente.',
                    confirmButtonText: 'Ir al Login',
                    background: '#d4edda',
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirigir a la página de login cuando se confirme la alerta
                        window.location.href = '../IniciarSesion/login.html';  // Redirección con la ruta correcta
                    }
                });
            } else {
                // Mostrar error si la cuenta no se creó
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Hubo un error al crear tu cuenta.',
                    confirmButtonText: 'Aceptar',
                    background: '#f8d7da',
                    showConfirmButton: true
                });
            }
        } catch (error) {
            console.error('Error:', error);
            // Mostrar un mensaje general en caso de error de red
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar tu solicitud',
                text: 'Hubo un problema al conectar con el servidor. Intenta nuevamente más tarde.',
                confirmButtonText: 'Aceptar',
                background: '#f8d7da',
                showConfirmButton: true
            });
        }
    });
});
