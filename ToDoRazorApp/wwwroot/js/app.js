document.addEventListener("DOMContentLoaded", () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));

    if (storedTasks) {
        storedTasks.forEach((task) => tasks.push(task));
        updateTasksList();
        updateStats();
    }

    const form = document.getElementById("taskForm");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        addTask();
    });
});

let tasks = [];
let recentlyDeleted = null;

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const addTask = () => {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();
    const dueDateInput = document.getElementById('dueDate');
    const dueDate = dueDateInput.value;

    if (text) {
        tasks.push({ text: text, completed: false, dueDate: dueDate });
        taskInput.value = "";
        dueDateInput.value = "";
        updateTasksList();
        updateStats();
        saveTasks();
    }
};

const deleteTask = (index) => {
    recentlyDeleted = { task: tasks[index], index };
    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
    saveTasks();
    showUndoSnackbar();
};

const showUndoSnackbar = () => {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerHTML = `Task deleted. <button onclick="undoDelete()">Undo</button>`;
    snackbar.className = "show";

    setTimeout(() => {
        snackbar.className = snackbar.className.replace("show", "");
        recentlyDeleted = null;
    }, 5000);
};

const undoDelete = () => {
    if (recentlyDeleted) {
        tasks.splice(recentlyDeleted.index, 0, recentlyDeleted.task);
        updateTasksList();
        updateStats();
        saveTasks();
        recentlyDeleted = null;
        document.getElementById("snackbar").className = "";
    }
};

const editTask = (index) => {
    const taskInput = document.getElementById('taskInput')
    taskInput.value = tasks[index].text;

    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
    saveTasks();
};

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTasksList();
    updateStats();
    saveTasks();
};

const updateTasksList = () => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    const now = new Date();
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("filterSelect").value;

    let filteredTasks = tasks.filter(task => {
        const textMatch = task.text.toLowerCase().includes(searchQuery);

        if (filter === "completed") return task.completed && textMatch;
        if (filter === "pending") return !task.completed && textMatch;
        if (filter === "today") {
            const today = new Date().toISOString().split('T')[0];
            const taskDate = new Date(task.dueDate);
            const isToday = taskDate.toDateString() === new Date().toDateString();
            return isToday && textMatch;
        }
        return textMatch;
    });

    filteredTasks.forEach((task, index) => {
        const listItem = document.createElement("li");

        listItem.innerHTML = `
        <div class="taskItem">
            <div class="task ${task.completed ? "completed" : ""}">
                <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
                <p>${task.text}</p>
                ${task.dueDate ? `<span class="due-date">${new Date(task.dueDate).toLocaleString()}</span>` : ''}
            </div>
            <div class="icons">
                <img src="./Images/edit.png" onClick="editTask(${index})"/>
                <img src="./Images/bin.png" onClick="deleteTask(${index})"/>
            </div>
        </div>
        `;

        const taskDiv = listItem.querySelector('.task');
        if (task.dueDate && new Date(task.dueDate) < now && !task.completed) {
            taskDiv.classList.add('overdue');
        }

        listItem.querySelector(".checkbox").addEventListener("change", () => {
            toggleTaskComplete(index);
        });
        taskList.append(listItem);
    });
};

document.getElementById("searchInput").addEventListener("input", updateTasksList);
document.getElementById("filterSelect").addEventListener("change", updateTasksList);

const blastConfetti = () => {
    const count = 200,
        defaults = {
            origin: { y: 0.7 },
        };

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            })
        );
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};

const updateStats = () => {
    const completeTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const progress = (completeTasks / totalTasks) * 100;
    const progressBar = document.getElementById("progress");

    progressBar.style.width = `${progress}%`;

    document.getElementById("numbers").innerText = `${completeTasks} / ${totalTasks}`;

    if (tasks.length && completeTasks === totalTasks) {
        blastConfetti();
    }
};

// Re-check tasks every 1 minute for overdue status
setInterval(() => {
    updateTasksList();
}, 60000); // 60,000 ms = 1 minute


