const storageKey = "talentord_waitlist";

function readEntries() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveEntry(entry) {
  const entries = readEntries();
  entries.push(entry);
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function getConfirmation(type) {
  if (type === "talento") {
    return "Gracias por registrarte. Ya formas parte de la lista inicial de TalentoRD.";
  }

  return "Gracias por unirte a la lista de espera. Tu interes nos ayuda a validar la demanda real.";
}

document.querySelectorAll(".signup-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const type = form.dataset.type;

    saveEntry({
      type,
      data,
      createdAt: new Date().toISOString(),
      source: "landing-estatica",
    });

    form.reset();
    form.querySelector(".form-status").textContent = getConfirmation(type);
  });
});
