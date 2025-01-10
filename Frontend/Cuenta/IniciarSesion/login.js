document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Obtener valores del formulario
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Enviar los datos al backend
            const response = await fetch('http://localhost:3000/iniciarSesion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            console.log('Respuesta del servidor:', result);

            if (result.success) {
                // Mostrar mensaje de éxito y redirigir
                Swal.fire({
                    icon: 'success',
                    title: 'Inicio de Sesión Exitoso',
                    text: 'Bienvenido de nuevo.',
                    confirmButtonText: 'Continuar',
                }).then(() => {
                    window.location.href = '/dashboard.html'; // Redirige al dashboard o página principal
                });
            } else {
                // Mostrar error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Credenciales inválidas.',
                });
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema con el servidor. Inténtalo más tarde.',
            });
        }
    });
});
