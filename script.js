const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

let config = JSON.parse(localStorage.getItem("config")) || {
    ruta10: 70,
    ruta10b: 70,
    rutaUni: 40
};

let state = JSON.parse(localStorage.getItem("state")) || {};

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Crear interfaz
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
            <select onchange="updateDay('${day}', 'novia', this.value)">
                <option ${state[day].novia === "none" ? "selected" : ""} value="none">No asiste</option>
                <option ${state[day].novia === "inces" ? "selected" : ""} value="inces">Solo INCES</option>
                <option ${state[day].novia === "uni" ? "selected" : ""} value="uni">Solo Universidad</option>
                <option ${state[day].novia === "both" ? "selected" : ""} value="both">INCES y Universidad</option>
            </select>

            <br>

            <strong>Gabriel:</strong>
            <input type="checkbox" ${state[day].yo ? "checked" : ""} 
                onchange="updateDay('${day}', 'yo', this.checked)">
			Universidad.
        `;

        container.appendChild(div);
    });

    saveState();
}

// Valores por defecto inteligentes
function defaultState(day) {
    return {
        novia: day === "Viernes" ? "inces" : "both",
        yo: true
    };
}

function updateDay(day, key, value) {
    state[day][key] = value;
    saveState();
}

function calculateDay(day) {
    let total = 0;
    const d = state[day];

    // Novia
    if (d.novia === "inces") {
        total += config.ruta10 * 2;
    } else if (d.novia === "uni") {
        total += config.ruta10b + config.rutaUni;
    } else if (d.novia === "both") {
        total += config.ruta10 * 2 + config.ruta10b + config.rutaUni;
    }

    // Yo
    if (d.yo) {
        total += config.ruta10b + config.rutaUni;
    }

    return total;
}

function calculate() {
    let total = 0;

    days.forEach(day => {
        total += calculateDay(day);
    });

    const extras = expenses.reduce((acc, e) => acc + e.amount, 0);
    total += extras;

    document.getElementById("total").innerText = "Total semanal: " + total + " Bolivares.";
}

// Configuración
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
}

// Gastos extra
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

        div.innerHTML = `<br>
            ${e.name} - ${e.amount} Bolivares.
            <button onclick="deleteExpense(${i})">Borrar</button>
        `;

        list.appendChild(div);
    });
}

// Persistencia
function saveState() {
    localStorage.setItem("state", JSON.stringify(state));
}

// Inicialización
renderDays();
renderExpenses();