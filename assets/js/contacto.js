/* =====================================================
   AMINOVITA - Lógica del Formulario de Contacto
   ===================================================== */

// 👇 EDITA AQUÍ los 3 contactos
const CONTACTOS = [
    {
        id: 'contacto1',
        nombre: 'Maria Valadez',
        cargo: '',
        email: 'ventas1@aminovitaquimicos.com.mx',
        whatsapp: '5585750874',
        telefonoTexto: '55 8575 0874',
        icono: 'bi-person-fill',
        color: '#9b7fe6'
    },
    {
        id: 'contacto2',
        nombre: 'Carla Alvares',
        cargo: '',
        email: 'ventas3@aminovitaquimicos.com.mx',
        whatsapp: '5549714812',
        telefonoTexto: '55 4971 4812',
        icono: 'bi-person-fill',
        color: '#5aa8d1'
    },
    {
        id: 'contacto3',
        nombre: 'Isabel Jiménez',
        cargo: '',
        email: 'direccion@aminovitaquimicos.com.mx',
        whatsapp: '5517577430',
        telefonoTexto: '55 1757 7430',
        icono: 'bi-person-fill',
        color: '#4fd8b8'
    }
];

const vistaTarjetas       = document.getElementById('vistaTarjetas');
const vistaFormulario     = document.getElementById('vistaFormulario');
const contenedorTarjetas  = document.getElementById('contenedorTarjetas');
const badgeContactoActivo = document.getElementById('badgeContactoActivo');
const btnVolver           = document.getElementById('btnVolver');
const formContacto        = document.getElementById('formContacto');
const btnEnviarWhatsapp   = document.getElementById('btnEnviarWhatsapp');

let contactoSeleccionado = null;

document.addEventListener('DOMContentLoaded', () => {
    renderizarTarjetas();
});

// --------------------------------------------------------------
// A. Renderizar las tarjetas ovaladas de contacto (apiladas)
// --------------------------------------------------------------
function renderizarTarjetas() {
    if (!contenedorTarjetas) return;

    contenedorTarjetas.innerHTML = CONTACTOS.map(c => `
        <div class="tarjeta-contacto" data-id="${c.id}" style="--color-acento: ${c.color};">
            <div class="icono-circulo">
                <i class="bi ${c.icono}"></i>
            </div>
            <div class="info-principal">
                <h5 class="fw-bold">${c.nombre}</h5>
                <p class="text-muted small mb-0">${c.cargo}</p>
            </div>
            <div class="info-secundaria">
                <p class="small mb-0"><i class="bi bi-envelope-fill me-1 text-danger"></i>${c.email}</p>
                <p class="small mb-0"><i class="bi bi-whatsapp me-1 text-success"></i>${c.telefonoTexto}</p>
            </div>
            <i class="bi bi-chevron-right flecha"></i>
        </div>
    `).join('');

    contenedorTarjetas.querySelectorAll('.tarjeta-contacto').forEach(tarjeta => {
        tarjeta.style.cursor = 'pointer';
        tarjeta.addEventListener('click', () => {
            contactoSeleccionado = CONTACTOS.find(c => c.id === tarjeta.dataset.id);
            mostrarFormulario();
        });
    });
}

// --------------------------------------------------------------
// B. Cambiar entre vista de tarjetas y vista de formulario (con fade)
// --------------------------------------------------------------
function mostrarFormulario() {
    vistaTarjetas.classList.add('fade-out');

    setTimeout(() => {
        vistaTarjetas.classList.add('d-none');
        vistaTarjetas.classList.remove('fade-out');

        vistaFormulario.classList.remove('d-none');
        badgeContactoActivo.textContent = `Contactando a: ${contactoSeleccionado.nombre}`;
        autorrellenarPerfil();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
}

function mostrarTarjetas() {
    vistaFormulario.classList.add('fade-out');

    setTimeout(() => {
        vistaFormulario.classList.add('d-none');
        vistaFormulario.classList.remove('fade-out');

        vistaTarjetas.classList.remove('d-none');
        formContacto.reset();
        formContacto.classList.remove('was-validated');
        contactoSeleccionado = null;
    }, 180);
}

if (btnVolver) {
    btnVolver.addEventListener('click', mostrarTarjetas);
}

// --------------------------------------------------------------
// C. Autorrellenar nombre, correo y empresa si hay sesión
// --------------------------------------------------------------
async function autorrellenarPerfil() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const nombreLocal = localStorage.getItem('usuarioNombre');
    if (nombreLocal) document.getElementById('nombre').value = nombreLocal;

    try {
        const respuesta = await fetch(`${API_URL}/api/auth/perfil`, {
            headers: { 'x-auth-token': token }
        });
        if (!respuesta.ok) return;

        const usuario = await respuesta.json();

        if (usuario.nombre)  document.getElementById('nombre').value = usuario.nombre;
        if (usuario.email)   document.getElementById('emailContacto').value = usuario.email;
        if (usuario.empresa) document.getElementById('empresaInput').value = usuario.empresa;

    } catch (error) {
        console.warn('No se pudo autorrellenar el perfil:', error);
    }
}

// --------------------------------------------------------------
// D. Envío por Correo
// --------------------------------------------------------------
if (formContacto) {
    formContacto.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!formContacto.checkValidity()) {
            e.stopPropagation();
            formContacto.classList.add('was-validated');
            return;
        }
        formContacto.classList.add('was-validated');

        const nombre   = document.getElementById('nombre').value;
        const email    = document.getElementById('emailContacto').value;
        const telefono = document.getElementById('telefono').value;
        const empresa  = document.getElementById('empresaInput').value;
        const mensaje  = document.getElementById('mensaje').value;

        const btnSubmit = document.getElementById('btnEnviarCorreo');
        const textoOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

        try {
            const respuesta = await fetch(`${API_URL}/api/contacto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre, email, telefono, empresa, mensaje,
                    destinatarioId: contactoSeleccionado.id
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Mensaje Enviado!',
                    text: `Tu mensaje fue enviado a ${contactoSeleccionado.nombre}.`,
                    confirmButtonColor: '#1a1a1a',
                    heightAuto: false
                });
                mostrarTarjetas();
            } else {
                Swal.fire({ icon: 'error', title: 'Oops...', text: datos.msg || 'Error al enviar.', heightAuto: false });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error de Conexión', heightAuto: false });
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    });
}

// --------------------------------------------------------------
// E. Envío por WhatsApp
// --------------------------------------------------------------
if (btnEnviarWhatsapp) {
    btnEnviarWhatsapp.addEventListener('click', () => {
        if (!formContacto.checkValidity()) {
            formContacto.classList.add('was-validated');
            return;
        }

        const nombre  = document.getElementById('nombre').value;
        const empresa = document.getElementById('empresaInput').value;
        const mensaje = document.getElementById('mensaje').value;

        const texto = `Hola, soy ${nombre}${empresa ? ' de ' + empresa : ''}.\n\n${mensaje}`;
        const url = `https://wa.me/${contactoSeleccionado.whatsapp}?text=${encodeURIComponent(texto)}`;

        window.open(url, '_blank');
    });
}