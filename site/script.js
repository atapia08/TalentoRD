const numberFormatter = new Intl.NumberFormat("en-US");
const apiEndpoints = window.TALENTORD_ENDPOINTS || {
  stats: "/api/stats",
  register: "/api/register",
};

function getConfirmation(type) {
  if (type === "talento") {
    return "Gracias por registrarte. Ya formas parte de la lista inicial de TalentoRD.";
  }

  return "Gracias por unirte a la lista de espera. Tu interés nos ayuda a validar la demanda real.";
}

function formatProgress(item) {
  return `${numberFormatter.format(item.current)}/${numberFormatter.format(item.goal)}`;
}

function progressPercent(item) {
  return `${Math.min((item.current / item.goal) * 100, 100).toFixed(2)}%`;
}

function updateCounter(type, item) {
  document.querySelectorAll(`[data-counter="${type}"] [data-count-label]`).forEach((label) => {
    label.textContent = formatProgress(item);
  });

  document.querySelectorAll(`[data-progress="${type}"]`).forEach((progress) => {
    progress.querySelector("[data-count-label]").textContent = formatProgress(item);
    progress.querySelector("[data-progress-bar]").style.width = progressPercent(item);
  });
}

async function loadStats() {
  const response = await fetch(apiEndpoints.stats, { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo cargar el contador");

  const stats = await response.json();
  updateCounter("talento", stats.talento);
  updateCounter("empresa", stats.empresa);
}

async function submitRegistration(type, data) {
  const response = await fetch(apiEndpoints.register, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, data }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "No se pudo guardar el registro");
  }

  updateCounter("talento", payload.stats.talento);
  updateCounter("empresa", payload.stats.empresa);
}

document.querySelectorAll(".signup-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const type = form.dataset.type;

    status.textContent = "Guardando registro...";

    try {
      await submitRegistration(type, data);
      form.reset();
      status.textContent = getConfirmation(type);
    } catch (error) {
      status.textContent = error.message;
    }
  });
});

loadStats().catch(() => {
  document.querySelectorAll(".form-status").forEach((status) => {
    status.textContent = "El contador real no está disponible. Revisa que el servidor Node esté corriendo.";
  });
});
