/* =====================================================
   AMINOVITA - Ver / Ocultar Contraseña
   Reutilizable en login.html y registro.html
   ===================================================== */

function togglePassword(inputId, btn) {
    const input  = document.getElementById(inputId);
    const icono  = btn.querySelector('i');
    const oculta = input.type === 'password';

    input.type = oculta ? 'text' : 'password';
    icono.classList.toggle('fa-eye');
    icono.classList.toggle('fa-eye-slash');
}
