const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// Configuración (tarifas)
let config = JSON.parse(localStorage.getItem("config")) || {
    ruta10: 70,
    ruta10b: 70,
    rutaUni: 40
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
            <h3>${day}</h3>

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
        Total semanal: Bs ${total} <br>
        🧍 Verónica: Bs ${totalVeronica} <br>
        🧍 Gabriel: Bs ${totalGabriel}
    `;
}


// ==========================
// CONFIGURACIÓN
// ==========================
function toggleConfig() {
    const panel = document.getElementById("configPanel");

    panel.style.display = panel.style.display === "none" ? "block" : "none";

    document.getElementById("ruta10").value = config.ruta10;
    document.getElementById("ruta10b").value = config.ruta10b;
    document.getElementById("rutaUni").value = config.rutaUni;
}

function saveConfig() {
    config.ruta10 = Number(document.getElementById("ruta10").value);
    config.ruta10b = Number(document.getElementById("ruta10b").value);
    config.rutaUni = Number(document.getElementById("rutaUni").value);

    localStorage.setItem("config", JSON.stringify(config));
    alert("Configuración guardada");
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

    renderExpenses();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
}

function renderExpenses() {
    const list = document.getElementById("expensesList");
    list.innerHTML = "";

    expenses.forEach((e, i) => {
        const div = document.createElement("div");
        div.className = "expense-item";

        div.innerHTML = `
            ${e.name} - Bs ${e.amount}
            <button data-index="${i}" class="deleteBtn">❌</button>
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
// BOTONES
// ==========================
document.getElementById("calculateBtn").addEventListener("click", calculate);
document.getElementById("toggleConfigBtn").addEventListener("click", toggleConfig);
document.getElementById("saveConfigBtn").addEventListener("click", saveConfig);
document.getElementById("addExpenseBtn").addEventListener("click", addExpense);


// ==========================
// INIT
// ==========================
renderDays();
renderExpenses();