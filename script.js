const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// Configuración (tarifas)
let config = JSON.parse(localStorage.getItem("config")) || {
    ruta10: 70,
    ruta10b: 120,
    rutaUni: 60
};

// Estado de la semana
let state = JSON.parse(localStorage.getItem("state")) || {};

// Gastos adicionales
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];


// ==========================
// RENDER DE DÍAS
// ==========================
function renderDays() {
    const container = document.getElementById("days");
    container.innerHTML = "";

    days.forEach(day => {
        if (!state[day]) {
            state[day] = defaultState(day);
        }

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h2>${day}</h2>

            <strong>Verónica:</strong>
            <select data-day="${day}" class="veronicaSelect">
                <option value="none">No asiste</option>
                <option value="inces">Solo INCES</option>
                <option value="uni">Solo Universidad</option>
                <option value="both">INCES + Universidad</option>
            </select>

            <br>

            <strong>Gabriel:</strong>
            <input type="checkbox" data-day="${day}" class="gabrielCheck">
        `;

        container.appendChild(div);

        div.querySelector(".veronicaSelect").value = state[day].veronica;
        div.querySelector(".gabrielCheck").checked = state[day].gabriel;
    });

    addEventListeners();
    saveState();
}


// ==========================
// ESTADO POR DEFECTO
// ==========================
function defaultState(day) {
    return {
        veronica: day === "Viernes" ? "inces" : "both",
        gabriel: true
    };
}


// ==========================
// EVENTOS
// ==========================
function addEventListeners() {
    document.querySelectorAll(".veronicaSelect").forEach(select => {
        select.addEventListener("change", e => {
            const day = e.target.dataset.day;
            state[day].veronica = e.target.value;
            saveState();
        });
    });

    document.querySelectorAll(".gabrielCheck").forEach(check => {
        check.addEventListener("change", e => {
            const day = e.target.dataset.day;
            state[day].gabriel = e.target.checked;
            saveState();
        });
    });
}


// ==========================
// CÁLCULOS POR DÍA
// ==========================
function calculateDay(day) {
    let totalVeronica = 0;
    let totalGabriel = 0;

    const d = state[day];

    // Verónica
    if (d.veronica === "inces") {
        totalVeronica += config.ruta10 * 2;
    } else if (d.veronica === "uni") {
        totalVeronica += config.ruta10b + config.rutaUni;
    } else if (d.veronica === "both") {
        totalVeronica += config.ruta10 * 2 + config.ruta10b + config.rutaUni;
    }

    // Gabriel
    if (d.gabriel) {
        totalGabriel += config.ruta10b + config.rutaUni;
    }

    return {
        veronica: totalVeronica,
        gabriel: totalGabriel,
        total: totalVeronica + totalGabriel
    };
}


// ==========================
// CÁLCULO TOTAL SEMANAL
// ==========================
function calculate() {
    let total = 0;
    let totalVeronica = 0;
    let totalGabriel = 0;

    days.forEach(day => {
        const result = calculateDay(day);

        total += result.total;
        totalVeronica += result.veronica;
        totalGabriel += result.gabriel;
    });

    // Gastos extra
    const extras = expenses.reduce((acc, e) => acc + e.amount, 0);
    total += extras;

    document.getElementById("total").innerHTML = `
        💰 Total Semanal: ${total} Bs.<br>
        👩 Verónica: ${totalVeronica} Bs.<br>
        👨 Gabriel: ${totalGabriel} Bs.
    `;

    const totalDiv = document.getElementById("total");

    // Forzar animación
    totalDiv.classList.remove("animate");
    void totalDiv.offsetWidth; // reinicia animación
    totalDiv.classList.add("animate");

    // Fade suave
    totalDiv.classList.add("fade-in");
}


// ==========================
// CONFIGURACIÓN
// ==========================
function toggleConfig() {
    const panel = document.getElementById("configPanel");
    panel.classList.toggle("active");

    document.getElementById("ruta10").value = config.ruta10;
    document.getElementById("ruta10b").value = config.ruta10b;
    document.getElementById("rutaUni").value = config.rutaUni;
}

function saveConfig() {
    const panel = document.getElementById("configPanel");
    panel.classList.toggle("active");
    config.ruta10 = Number(document.getElementById("ruta10").value);
    config.ruta10b = Number(document.getElementById("ruta10b").value);
    config.rutaUni = Number(document.getElementById("rutaUni").value);

    localStorage.setItem("config", JSON.stringify(config));
}


// ==========================
// GASTOS EXTRA
// ==========================
function addExpense() {
    const name = document.getElementById("extraName").value;
    const amount = Number(document.getElementById("extraAmount").value);

    if (!name || !amount) return;

    expenses.push({ name, amount });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    document.getElementById("extraName").value = "";
    document.getElementById("extraAmount").value = "";

    renderExpenses();
}

function deleteExpense(index) {
    const items = document.querySelectorAll(".expense-item");
    const item = items[index];

    if (!item) return;

    item.classList.add("removing");

    setTimeout(() => {
        expenses.splice(index, 1);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderExpenses();
    }, 250); // igual a la transición
}

function renderExpenses() {
    const list = document.getElementById("expensesList");
    list.innerHTML = "";

    expenses.forEach((e, i) => {
        const div = document.createElement("div");
        div.className = "expense-item";

        div.innerHTML = `<br>
            ${e.name} - ${e.amount} Bs.
            <button data-index="${i}" class="deleteBtn">Borrar</button>
        `;

        list.appendChild(div);
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", e => {
            deleteExpense(e.target.dataset.index);
        });
    });
}


// ==========================
// PERSISTENCIA
// ==========================
function saveState() {
    localStorage.setItem("state", JSON.stringify(state));
}




// ==========================
// INIT
// ==========================

// Registro del Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .then(reg => console.log("Service Worker registrado"))
            .catch(err => console.log("Error:", err));
    });
}

// Inicializar state si no existe en localStorage
if (!localStorage.getItem("state")) {
    state = {};
    days.forEach(day => {
        state[day] = defaultState(day);
    });
    saveState();
}

document.addEventListener("DOMContentLoaded", () => {
    renderDays();
    renderExpenses();

    
// ==========================
// BOTONES
// ==========================
	
	document.getElementById("calculateBtn").addEventListener("click", calculate);
	document.getElementById("toggleConfigBtn").addEventListener("click", toggleConfig);
	document.getElementById("saveConfigBtn").addEventListener("click", saveConfig);
	document.getElementById("addExpenseBtn").addEventListener("click", addExpense);
});