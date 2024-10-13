let data = {
    "page1": {}
};

const taskBase = document.createElement("label");
taskBase.classList.add("task");

function loadData() {
    let savedData = localStorage.getItem('data');
    if (savedData) {
        data = JSON.parse(savedData);
        Object.keys(data.page1).forEach((taskId) => {
            const task = data.page1[taskId];
            createNewLine(task.state, task.title, taskId);
        });
    } else {
        createNewLine(false, "", generateTaskId());
    }
}

function saveData() {
    localStorage.setItem('data', JSON.stringify(data));
}

function createNewLine(state, title, taskId = generateTaskId(), focus = false) {
    const canvas = document.getElementById("canvas");
    taskBase.innerHTML = `
        <input type="checkbox" class="checkbox" ${state ? "checked" : ""}>
        <span class="checkmark"></span>
        <textarea class="title" rows="1" cols="25" style="overflow:hidden">${title}</textarea> 
    `;
    let newTask = taskBase.cloneNode(true);
    const textarea = newTask.querySelector('textarea');
    const checkbox = newTask.querySelector('.checkbox');

    newTask.dataset.taskId = taskId;

    textarea.addEventListener('input', autoResizeTextarea);
    autoResizeTextarea.call(textarea);

    textarea.addEventListener('input', function () {
        data.page1[taskId].title = textarea.value;
        saveData();
    });

    checkbox.addEventListener('change', function () {
        data.page1[taskId].state = checkbox.checked;
        saveData();
    });

    if (canvas.childElementCount < 13) {
        canvas.appendChild(newTask);

        if (focus) {
            textarea.focus();
        }
    }
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.scrollHeight === 0 ? this.style.height = '34px' : this.style.height = this.scrollHeight + 'px';
}

function generateTaskId() {
    return 'task' + new Date().getTime();
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const newTaskId = generateTaskId();
        data.page1[newTaskId] = { state: false, title: "" };
        createNewLine(false, "", newTaskId, true);
    } else if (event.key === "Backspace") {
        const textarea = document.activeElement;
        if (!textarea.value) {
            const taskId = textarea.parentElement.dataset.taskId;
            deleteTask(taskId);
        }
    }
});

function deleteTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const canvas = document.getElementById("canvas");

    if (Object.keys(data.page1).length <= 1) {
        return; // Если это последний таск, ничего не делаем
    }

    if (taskElement) {
        taskElement.remove();
    }

    const remainingTasks = Object.keys(data.page1);
    const taskIndex = remainingTasks.indexOf(taskId);

    delete data.page1[taskId];
    saveData();

    // Переход фокуса
    if (taskIndex > 0) {
        const previousTaskId = remainingTasks[taskIndex - 1];
        const previousTaskElement = document.querySelector(`[data-task-id="${previousTaskId}"] textarea`);
        if (previousTaskElement) {
            previousTaskElement.focus();
            previousTaskElement.setSelectionRange(previousTaskElement.value.length, previousTaskElement.value.length);
        }
    } else if (taskIndex === 0 && remainingTasks.length > 1) {
        // Если удален самый первый таск, фокусируемся на новом первом таске
        const newFirstTaskId = remainingTasks[1]; // Берем ID нового первого таска
        const newFirstTaskElement = document.querySelector(`[data-task-id="${newFirstTaskId}"] textarea`);
        if (newFirstTaskElement) {
            newFirstTaskElement.focus();
            newFirstTaskElement.setSelectionRange(newFirstTaskElement.value.length, newFirstTaskElement.value.length);
        }
    }
}


loadData();
