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

function getFormData(form) {
  const data = {};

  new FormData(form).forEach((value, key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
      return;
    }

    data[key] = value;
  });

  return data;
}

function updateMultiSelectState(group) {
  const max = Number(group.dataset.maxSelected || 10);
  const checked = [...group.querySelectorAll('input[type="checkbox"]:checked')];
  const count = group.querySelector("[data-selection-count]");

  group.querySelectorAll('input[type="checkbox"]:not(:checked)').forEach((input) => {
    input.disabled = checked.length >= max;
  });

  count.textContent = `${checked.length}/${max} seleccionadas`;
  count.classList.toggle("is-maxed", checked.length >= max);
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

    const data = getFormData(form);
    const type = form.dataset.type;

    if (type === "talento" && (!data.area || !data.oportunidad)) {
      status.textContent = "Selecciona al menos un área de talento y un tipo de oportunidad.";
      return;
    }

    status.textContent = "Guardando registro...";

    try {
      await submitRegistration(type, data);
      form.reset();
      form.querySelectorAll(".multi-select").forEach(updateMultiSelectState);
      status.textContent = getConfirmation(type);
    } catch (error) {
      status.textContent = error.message;
    }
  });
});

document.querySelectorAll(".multi-select").forEach((group) => {
  updateMultiSelectState(group);
  group.addEventListener("change", () => updateMultiSelectState(group));
});

loadStats().catch(() => {
  document.querySelectorAll(".form-status").forEach((status) => {
    status.textContent = "El contador real no está disponible. Revisa que el servidor Node esté corriendo.";
  });
});
