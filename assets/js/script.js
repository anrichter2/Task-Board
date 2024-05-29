// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

const taskFormEl = $('#input-form')
const submitButtonEl = $('#submit-button')
const taskDisplayEl = $('#task-display')
const taskTitle = $('#task-title-input');
const taskDate = $('#task-date-input');
const taskDescription = $('#task-description-input');

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const randomId = crypto.randomUUID();
  return randomId
}

// Todo: create a function to create a task card
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

  if (task.dueDate && task.status !== 'done') {
    const today = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (today.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (today.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      buttonDelete.addClass('border-light');
    }
  }

  return taskCard
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const tasks = JSON.parse(localStorage.getItem("tasks"));

  const toDoList = $('#todo-cards');
  toDoList.empty();
  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();
  const doneList = $('#done-cards');
  doneList.empty();

  for (let task of tasks) {
    if (task.status === 'to-do') {
      toDoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }

  }

  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
  
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
  event.preventDefault();

  let randomId = generateTaskId();

  const newTask = {
    id: randomId, //might just use the generateTaskId() here instead
    title: taskTitle.val().trim(),
    dueDate: taskDate.val(),
    description: taskDescription.val().trim(),
    status: 'to-do'
  };

  let tasks = JSON.parse(localStorage.getItem("tasks"));

  if (tasks === null) {
    tasks = [];
  };

  tasks.push(newTask);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
  event.preventDefault();
  const taskId = $(this).attr('data-task-id');
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      tasks.splice(i,1);
    };
  };

  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const taskId = ui.draggable[0].dataset.taskId; // What is this taskId variable and where does it come from
  const newStatus = event.target.id;

  for (let task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus;
    };
  };

  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

  renderTaskList();

  taskFormEl.on('submit', handleAddTask);

    $( "#task-date-input" ).datepicker({
      changeMonth: true,
      changeYear: true
    });

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });


});


taskDisplayEl.on('click', '.delete', handleDeleteTask);

$( function() {
    var dialog, form,
 
    dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      
      close: function() {
        form[ 0 ].reset();
        allFields.removeClass( "ui-state-error" );
      }
    });
 
    form = dialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addUser();
    });
 
    $( "#add-task" ).button().on( "click", function() {
      dialog.dialog( "open" );
    });

    $( "#submit-button" ).button().on( "click", function() {
      dialog.dialog( "close" );
    });

    
  } );