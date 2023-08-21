var srcElement = null;

function dragStart(e) {
  // Target (this) element is the source node.
  srcElement = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);

  this.classList.add('dragged');
}
function dragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

  return false;
}

function dragEnter(e) {
  // this / e.target is the current hover target.
}

function dragLeave(e) {
  this.classList.remove('over'); // this / e.target is previous target element.
}

function elementDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (srcElement != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    //alert(this.outerHTML);
    //srcElement.innerHTML = this.innerHTML;
    //this.innerHTML = e.dataTransfer.getData('text/html');
    this.parentNode.removeChild(srcElement);
    var dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin', dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlers(dropElem);
  }
  this.classList.remove('over');
  return false;
}

function dragEnd(e) {
  // this/e.target is the source node.
  this.classList.remove('over');
  console.log('dragEnd : ', e);
}

function addDnDHandlers(elem) {
  elem.addEventListener('dragstart', dragStart, false);
  elem.addEventListener('dragenter', dragEnter, false);
  elem.addEventListener('dragover', dragOver, false);
  elem.addEventListener('dragleave', dragLeave, false);
  elem.addEventListener('drop', elementDrop, false);
  elem.addEventListener('dragend', dragEnd, false);
}

var cols = document.querySelectorAll('.drag-drop .draggable');
[].forEach.call(cols, addDnDHandlers);

$(init);
$(BoardColumnsGet);

function init() {
  $('.kanban-items,.todo-task1 tbody')
    .sortable({
      connectWith: '.kanban-items,.todo-task1 tbody',
      stack: '.kanban-items  ul,.todo-task1 tbody',
    })
    .disableSelection();
  $('.kanban-container,.todo-task2 tbody')
    .sortable({
      connectWith: '.kanban-container,.todo-task2 tbody ',
      stack: '.kanban-container,.todo-task2 tbody',
      item: $('.kanban-container,.todo-task2 tbody'),
      start: function (e, i) {
        console.log('start : ', e, i);
      },
      stop: function (e, i) {
        console.log('stop : ', e, i);
        reorder();
      },
    })
    .disableSelection();

  // Object.values($('.kanban-container,.todo-task2 tbody')).forEach(async (column, index) => {
  //   console.log('testest: ', column, index);
  // });
}

// 번호 재입력( 내부적으로 )
function reorder() {
  Object.values($('.kanban-list')).forEach(async (column, index) => {
    console.log('testest: ', column, index);
  });
}

// get column API
function BoardColumnsGet() {
  $.ajax({
    method: 'GET',
    data: { boardId: 1 },
    url: `/board-columns`,
    success: (data) => {
      BoardColumns(data);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get board column, card getHtml
function BoardColumns(data) {
  console.log(data);
  const kanbanList = document.querySelector('.kanban-container');
  kanbanList.innerHTML = `<div class="list kanban-list draggable" draggable="true">
                            <div class="kanban-tops list-tops">
                              <div class="d-flex justify-content-between align-items-center py-10">
                                  <h3 class="list-title">To Do</h3>
                                  <div class="dropdown dropdown-click">
                                    <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                    </button>
                                    <div class="dropdown-default dropdown-bottomRight dropdown-menu" style="">
                                        <a class="dropdown-item" href="#">Edit Card Title</a>
                                        <a class="dropdown-item" href="#">Delete Card</a>
                                    </div>
                                  </div>
                              </div>
                            </div>

                            <ul class="kanban-items list-items  drag-drop ">

                              <li class="d-flex justify-content-between align-items-center ">
                                  <div class="lists-items-title" data-bs-toggle="modal" data-bs-target="#exampleModal" data-whatever="@mdo72">
                                    File Manager Design
                                  </div>
                                  <button class="open-popup-modal" type="button">
                                    <img src="./assets/img/svg/edit-2.svg" alt="edit-2" class="svg">
                                  </button>
                                  <div class="popup-overlay">
                                    <!--Creates the popup content-->
                                    <div class="popup-content">
                                        <div class="mb-10 popup-textarea">
                                          <textarea class="form-control" rows="3" placeholder="Edit title..."></textarea>
                                        </div>
                                        <div class="d-flex align-items-center popup-button">
                                          <button class="save-title-changes btn btn-primary btn-sm btn-squared rounded" type="submit">Submit</button>
                                        </div>
                                        <div class="overlay-close"></div>
                                    </div>
                                  </div>
                              </li>
                              <li class="d-flex justify-content-between align-items-center ">
                                  <div class="lists-items-title" data-bs-toggle="modal" data-bs-target="#exampleModal" data-whatever="@mdo6">
                                    Knowledgebase
                                  </div>
                                  <button class="open-popup-modal" type="button">
                                    <img src="./assets/img/svg/edit-2.svg" alt="edit-2" class="svg">
                                  </button>
                                  <div class="popup-overlay">
                                    <!--Creates the popup content-->
                                    <div class="popup-content">
                                        <div class="mb-10 popup-textarea">
                                          <textarea class="form-control" rows="3" placeholder="Edit title..."></textarea>
                                        </div>
                                        <div class="d-flex align-items-center popup-button">
                                          <button class="save-title-changes btn btn-primary btn-sm btn-squared rounded" type="submit">Submit</button>
                                        </div>
                                        <div class="overlay-close"></div>
                                    </div>
                                  </div>
                              </li>

                            </ul>

                            <button class="add-card-btn"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a
                              card</button>

                          </div>`;
  kanbanList.innerHTML += `<div class="kanban-list list draggable" draggable="true">
                            <div class="list__add-card">
                              <div class="kanban-board__add-card">
                                  <button class="shadow-none border-0"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg">
                                    Add
                                    column</button>
                              </div>
                            </div>
                          </div>`;
}
