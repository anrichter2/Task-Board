// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// References to DOM elements used for event listeners and retrieving task data
const taskFormEl = $('#input-form');
const submitButtonEl = $('#submit-button');
const taskDisplayEl = $('#task-display');
const taskTitle = $('#task-title-input');
const taskDate = $('#task-date-input');
const taskDescription = $('#task-description-input');

// Function to generate a unique task id for each task
function generateTaskId() {
  const randomId = crypto.randomUUID();
  return randomId
}

// Function that creates a task card by creating individual elements, sets classes and text, then appends all the pieces together
function createTaskCard(task) {
  const taskCard = $('<div>');
  taskCard.addClass('card task-card draggable');
  taskCard.attr('data-task-id', task.id);

  const bodyEl = $('<div>');
  bodyEl.addClass('card-body');

  const titleEl = $('<div>');
  titleEl.addClass('card-header h4');
  titleEl.text(task.title);

  const descriptionEl = $('<p>');
  descriptionEl.addClass('card-text');
  descriptionEl.text(task.description);

  const dateEl = $('<p>');
  dateEl.addClass('card-text');
  dateEl.text(task.dueDate);

  const buttonDelete = $('<button>');
  buttonDelete.addClass('btn btn-danger delete');
  buttonDelete.text('Delete');
  buttonDelete.attr('data-task-id', task.id);

  bodyEl.append(descriptionEl);
  bodyEl.append(dateEl);
  bodyEl.append(buttonDelete);
  taskCard.append(titleEl);
  taskCard.append(bodyEl);

  // If loop that checks if the card has a due date and that it doesn't have a status of done
  if (task.dueDate && task.status !== 'done') {
    const today = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    // If loop that causes task card to turn yellow if due date is the same as todays date, and turns card red if today is after the due date
    if (today.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (today.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      buttonDelete.addClass('border-light');
    }
  }

  return taskCard
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  const tasks = JSON.parse(localStorage.getItem("tasks"));

  // Using .empty method to remove all task cards from each lane
  const toDoList = $('#todo-cards');
  toDoList.empty();
  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();
  const doneList = $('#done-cards');
  doneList.empty();

  //for and if loop that looks at the status of each task and then creates a task card and appends them to the correct lane based on status
  for (let task of tasks) {
    if (task.status === 'to-do') {
      toDoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  // Jquery drag function that creates a semi-transparent clone of the draggable card element and makes the clone keep the width of the original. Honsetly, the helper function mainly comes from the class mini project
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    
    helper: function (event) {
      const original = $(event.target).hasClass('draggable')
        ? $(event.target)
        : $(event.target).closest('.draggable');
      
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
  
}

// Function to handle adding a new task
function handleAddTask(event){
  event.preventDefault();

  let randomId = generateTaskId();

  // Creating a new task object based off information entered in the form modal
  const newTask = {
    id: randomId,
    title: taskTitle.val().trim(),
    dueDate: taskDate.val(),
    description: taskDescription.val().trim(),
    status: 'to-do'
  };

  //retrieving tasks from local storage and if there aren't any we create a new task array
  let tasks = JSON.parse(localStorage.getItem("tasks"));

  if (tasks === null) {
    tasks = [];
  };

  //Using push method to add the new task object to tasks array and then saving to local storage
  tasks.push(newTask);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Clear the modal form of previous values
  taskTitle.val('');
  taskDate.val('');
  taskDescription.val('');

  renderTaskList();
}

// Function to handle deleting a task
function handleDeleteTask(event){
  event.preventDefault();

  // Creating a variable with the same data task id as a delete button that was activated with a click event
  const taskId = $(this).attr('data-task-id');
  const tasks = JSON.parse(localStorage.getItem('tasks'));

  // For and if loop that runs though the tasks array, finds the task with the same id as the selected delete button, and then splices it out of the array
  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      tasks.splice(i,1);
    };
  };

  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

  // variables that are set to the task id of the task that was dragged and the id of the lane it was dragged to
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  // For and if loop that runs through the tasks array to find the matching task id and update the status
  for (let task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus;
    };
  };

  localStorage.setItem('tasks', JSON.stringify(tasks));

  renderTaskList();
}

// Function that fires when the page loads which renders the task list, makes the due date field of the modal a datepicker, and makes task lanes droppable using handleDrop function
$(document).ready(function () {

  renderTaskList();

  $( "#task-date-input" ).datepicker({
    changeMonth: true,
    changeYear: true
  });
  
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
  
});

// Event listeners for the modal form being submitted and the delete button of the task cards being clicked
taskFormEl.on('submit', handleAddTask);

taskDisplayEl.on('click', '.delete', handleDeleteTask);
