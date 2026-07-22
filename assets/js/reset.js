/* =====================================================
   AMINOVITA - Lógica de Restablecimiento de Contraseña
   Página: reset.html
   ===================================================== */

// Leer ID y token enviados por correo en la URL
const urlParams = new URLSearchParams(window.location.search);
const id        = urlParams.get('id');
const token     = urlParams.get('token');

// Si el enlace es inválido, redirigir inmediatamente
if (!id || !token) {
    Swal.fire({
        icon: 'error',
        title: 'Enlace inválido',
        text: 'Vuelve a solicitar el correo de recuperación.',
        confirmButtonColor: '#8A8AF6'
    }).then(() => window.location.href = './login.html');
}


/* ── FORMULARIO DE NUEVA CONTRASEÑA ──────────────── */

const formReset = document.getElementById('formReset');

if (formReset) {
    formReset.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!formReset.checkValidity()) {
            e.stopPropagation();
            formReset.classList.add('was-validated');
            return;
        }
        formReset.classList.add('was-validated');

        const password = document.getElementById('password').value;
        const confirm  = document.getElementById('confirmPassword').value;

        if (password !== confirm) {
            return Swal.fire({
                icon: 'error',
                title: 'Las contraseñas no coinciden',
                text: 'Verifica que ambas contraseñas sean iguales.',
                confirmButtonColor: '#8A8AF6'
            });
        }

        const btn          = formReset.querySelector('button[type="submit"]');
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
        btn.disabled  = true;

        try {
            const res  = await fetch(`${API_URL}/api/auth/nuevo-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, token, password })
            });

            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Contraseña Actualizada!',
                    text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
                    confirmButtonColor: '#8A8AF6'
                });
                window.location.href = './login.html';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.msg || 'No se pudo actualizar la contraseña.',
                    confirmButtonColor: '#8A8AF6'
                });
                btn.innerHTML = textoOriginal;
                btn.disabled  = false;
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#8A8AF6'
            });
            btn.innerHTML = textoOriginal;
            btn.disabled  = false;
        }
    });
}
