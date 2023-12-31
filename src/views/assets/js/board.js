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

// -----------------여기서부터 작업함--------------------
let boardId = new URLSearchParams(window.location.search).get('boardId');
let workspaceName;

$(document).ready(() => {
  BoardColumnsGet('');
  initializeMemberInput('#cardCreateAddMemberBtn', '#cardCreateMemberView', '#selected-members');
  initializeMemberInput('#cardUpdateAddMembers', '#cardUpdateMembers', '#update-selected-members');
});

function init() {
  $('.kanban-items,.todo-task1 tbody')
    .sortable({
      containment: '.kanban-container',
      items: '.align-items-center',
      connectWith: '.kanban-items,.todo-task1 tbody',
      // stack: '.kanban-items,.todo-task1 tbody',
      start: function (e, i) {},
      stop: function (e, i) {
        CardListReorder();
      },
    })
    .disableSelection();
  $('.kanban-container,.todo-task2 tbody')
    .sortable({
      connectWith: '.kanban-container,.todo-task2 tbody ',
      stack: '.kanban-container,.todo-task2 tbody',
      start: function (e, i) {},
      stop: function (e, i) {
        ColumnListReorder();
      },
    })
    .disableSelection();
}

// 바뀐 순서 출력 (여기서 순서 update api 사용할듯)
function ColumnListReorder() {
  const columns = document.querySelectorAll('.kanban-list');
  Object.values(columns).forEach(async (column, index) => {
    const columnId = column.getAttribute('data-columnid');
    if (columnId != 0) {
      //컬럼 순서 저장
      const sequence = Number(index) + 1;
      await BoardColumnSequenceUpdate(columnId, sequence);
    }
  });
}

function CardListReorder() {
  const cards = document.querySelectorAll('#card-list-item');
  Object.values(cards).forEach(async (card, index) => {
    const columnId = card.parentElement.getAttribute('data-columnId');
    const cardId = card.getAttribute('data-cardId');
    await CardSequenceUpdate(columnId, cardId, index + 1);
  });
}

// put column sequence API
async function BoardColumnSequenceUpdate(columnId, sequence) {
  $.ajax({
    type: 'PUT',
    url: `/board-columns/${columnId}/sequence?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ sequence }),
    success: (data) => {},
    error: (error) => {
      console.log(error);
    },
  });
}

// get column API
async function BoardColumnsGet(search) {
  await $.ajax({
    type: 'GET',
    url: `/board-columns?boardId=${boardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: async (data) => {
      workspaceName = data.workspaceName;
      BoardColumns(data.columns, search);
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      }).then(() => {
        window.location.href = '/';
      });
    },
  });
}

// get board column, card getHtml
// 아직 card api가 없기 때문에 column만 일단 넣음
let cardIndex = 0;
async function BoardColumns(data, search) {
  document.querySelector(
    '.breadcrumb-main'
  ).innerHTML = `<h4 class="text-capitalize breadcrumb-title">${workspaceName}</h4>
                <div class="breadcrumb-action justify-content-center flex-wrap">
                  <nav aria-label="breadcrumb">
                      <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/"><i class="uil uil-estate"></i>Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">${workspaceName}</li>
                      </ol>
                  </nav>
                </div>
                `;
  document.querySelector(
    '.kanban-header'
  ).innerHTML = `<div class="col-4" style="width: fit-content; margin-top: 10px;"><h4>${data[0].boardName}</h4></div>
  <div class="col-4 kanban-board__add-card">
  <a class="btn px-15 btn-primary" style="width: fit-content;" data-bs-toggle="modal" data-bs-target="#editColumnModal">
                컬럼 추가</a>`;

  const kanbanList = document.querySelector('.kanban-container');
  kanbanList.innerHTML = '';
  let i = 0;
  for (i in data) {
    const card = await CardGet(data[i].columnId);
    let cardHtml = '';
    for (let c of card) {
      let members = '';
      for (let m of c.cardMembers) {
        let Img = '';
        m.profile_url ? (Img = `${m.profile_url}`) : (Img = `/assets/img/favicon.png`);
        members += `<li style="background-color:transparent; margin:0; padding:0;">
                    <img class="rounded-circle wh-34 bg-opacity-secondary" src="${Img}"/>
                  </li>`;
      }
      if (!search) {
        cardHtml += `<li class="d-flex justify-content-between row align-items-center " draggable="true" id="card-list-item" data-columnId=${data[i].columnId} data-cardId=${c.cardInfo.id} style="border:1px solid ${c.cardInfo.color}; background-color: ${c.cardInfo.color}10; font-weight: bold">
                      ${c.cardInfo.name}       
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
                    <div style="pointer-events: none; min-height: 65px;">                          
                      <p class="fs-13 color-light mb-10">참여 멤버</p>
                        <ul class="d-flex flex-wrap">
                        ${members}
                        </ul>
                    </div>
                </li>`;
      } else if (c.cardInfo.name.search(search) > -1) {
        cardHtml += `<li class="d-flex justify-content-between align-items-center " draggable="true" id="card-list-item" data-columnId=${data[i].columnId} data-cardId=${c.cardInfo.id} style="border:1px solid ${c.cardInfo.color}; background-color: ${c.cardInfo.color}10; font-weight: bold">
                      ${c.cardInfo.name}
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
                    <div style="pointer-events: none; min-height: 65px;">                          
                      <p class="fs-13 color-light mb-10">참여 멤버</p>
                        <ul class="d-flex flex-wrap">
                        ${members}
                        </ul>
                    </div>
                </li>`;
      }
    }
    cardIndex += Number(card.length);
    if (data[i].columnName == '완료') {
      kanbanList.innerHTML += `<div class="list kanban-list draggable" data-columnId="${data[i].columnId}">
                                  <div class="kanban-tops list-tops">
                                    <div class="d-flex justify-content-between align-items-center py-10">
                                        <h3 class="list-title" style="font-weight: bold">${data[i].columnName}</h3>
                                    </div>
                                  </div>  
                                  <div id="cardListItems${data[i].columnId}" >
                                    <ul class="kanban-items list-items  drag-drop " id="card-item${data[i].columnId}" style="height: 600px;" data-columnId="${data[i].columnId}">
                                    ${cardHtml}
                                    </ul>
                                    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${data[i].columnId}" data-index="${cardIndex}"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg">카드 추가</button>
                                  </div>
  
                                </div>`;
    } else {
      kanbanList.innerHTML += `<div class="list kanban-list draggable" data-columnId=${data[i].columnId}>
                                  <div class="kanban-tops list-tops">
                                    <div class="d-flex justify-content-between align-items-center py-10">
                                        <h3 class="list-title" style="font-weight: bold">${data[i].columnName}</h3>
                                        <div class="dropdown dropdown-click">
                                          <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                              <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                          </button>
                                          <div class="dropdown-default dropdown-bottomRight dropdown-menu" style="">
                                              <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#updateColumnModal" id="updateColumnTitle" data-value="${data[i].columnId}" data-title="${data[i].columnName}">컬럼명 수정</a>
                                              <a class="dropdown-item" id="ColumnDeleteBtn" value="${data[i].columnId}">삭제</a>
                                          </div>
                                        </div>
                                    </div>
                                  </div>
  
                                  <div id="cardListItems${data[i].columnId}">
                                    <ul class="kanban-items list-items  drag-drop " id="card-item${data[i].columnId}" style="height: 600px;" data-columnId="${data[i].columnId}">
                                    ${cardHtml}       
                                    </ul>
                                    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${data[i].columnId}" data-index="${cardIndex}"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg">카드 추가</button>
                                  </div>
  
                                </div>`;
    }
  }
  init();
  // column add button click
  document.getElementById('ColumnAddBtn').addEventListener('click', (a) => {
    // Number(i) + 1 -> sequence
    const columnTitle = document.getElementById('columnTitle').value;
    BoardColumnsCreate(columnTitle, Number(i));
  });

  // column create api
  async function BoardColumnsCreate(name, sequence) {
    await $.ajax({
      type: 'POST',
      url: `/board-columns?boardId=` + boardId,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name, sequence }),
      success: (data) => {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'success',
          title: 'Success',
          text: data.message,
        }).then(() => {
          location.reload();
        });
      },
      error: (error) => {
        if (error.status === 308) {
          Swal.fire({
            customClass: {
              container: 'my-swal',
            },
            icon: 'error',
            title: 'error',
            text: error.responseJSON.message,
          }).then(() => {
            window.location.href = '/block';
          });
        } else {
          Swal.fire({
            customClass: {
              container: 'my-swal',
            },
            icon: 'error',
            title: 'error',
            text: error.responseJSON.message[0],
          });
        }
      },
    });
  }

  //column delete button click
  document.querySelectorAll('#ColumnDeleteBtn').forEach((data) => {
    data.addEventListener('click', async (e) => {
      const columnId = e.target.getAttribute('value');
      deleteConfirmModal(columnId, '', 'column');
    });
  });

  //모달창이 열리면 해당 모달창에 value값으로 columnId값을 보내거나 받아와야함
  let columnId;
  document.querySelectorAll('#updateColumnTitle').forEach((data) => {
    data.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-value');
      const title = e.target.getAttribute('data-title');
      document.getElementById('columnTitleUpdate').value = title;
      columnId = id;
    });
  });

  document.getElementById('ColumnUpdateNameBtn').addEventListener('click', () => {
    const columnTitle = document.getElementById('columnTitleUpdate').value;
    BoardColumnNameUpdate(columnId, columnTitle);
  });

  // 카드 생성 멤버 추가 버튼 클릭 시
  document.getElementById('cardCreateAddMemberBtn').addEventListener('click', () => {
    if ($('#cardCreateAddMemberBox').css('display') == 'none') {
      $('#cardCreateAddMemberBox').show();
    } else {
      $('#cardCreateAddMemberBox').hide();
    }
  });

  // 카드 수정에서 멤버 추가 버튼 클릭 시
  document.getElementById('cardUpdateAddMembers').addEventListener('click', () => {
    if ($('#cardUpdateAddMemberBox').css('display') == 'none') {
      $('#cardUpdateAddMemberBox').show();
    } else {
      $('#cardUpdateAddMemberBox').hide();
    }
  });
  // card detail box click
  // 모달창이 열리면 해당하는 card 값들을 뿌려주기, member초대란 만들기, 댓글란 만들기
  document.querySelectorAll('#card-list-item').forEach((data) => {
    data.addEventListener('click', (e) => {
      const cardId = e.target.getAttribute('data-cardId');
      const columnId = e.target.getAttribute('data-columnId');
      DetailCardGet(columnId, cardId);
    });
  });

  // cardDeleteBtn 클릭 시
  document.getElementById('cardDeleteBtn').addEventListener('click', async () => {
    // await CardDelete(columnId, cardId);
  });

  // 대댓글 작성 버튼
  document.getElementById('replayCommentBtn').addEventListener('click', () => {
    if ($('#commentAddBox').css('display') == 'none') {
      $('#commentAddBox').show();
    } else {
      $('#commentAddBox').hide();
    }
  });
  // card create button click
  //모달 창이 열리면 해당 columnId값을 보내줘야함
  let cardSequence;
  let cardColumnId;
  document.querySelectorAll('#createCard').forEach((data) => {
    data.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-columnId');
      cardColumnId = id;
      const sequence = e.target.getAttribute('data-index');
      cardSequence = Number(sequence) + 1;

      //update 모달과 같이 배열과 변수를 사용하기 때문에 create 모달 펼칠시 초기화 필요
      filesArr = [];
      fileNo = 0;
      filesNameArr = [];
      filesSizeArr = [];

      selectedMembers = [];
      selectedMemberNumber = [];
      document.querySelector('.file-list').innerHTML = '';

      checklistNo = 0;
      checkListContentArr = [];
      document.querySelector('#checkListBox').children[1].innerHTML = '';
      $('#checkListBox').hide();
    });
  });

  document.getElementById('CardCreateBtn').addEventListener('click', async () => {
    const cardTitle = document.getElementById('cardTitleCreate').value;
    const cardColor = document.getElementById('cardColorCreate').value;
    const cardContent = document.getElementById('cardContentCreate').value;
    // 폼데이터 담기
    let form = document.querySelector('form');
    let formData = new FormData(form);
    if (filesArr) {
      for (let i = 0; i < filesArr.length; i++) {
        // 삭제되지 않은 파일만 폼데이터에 담기
        if (!filesArr[i].is_delete) {
          formData.append('newFiles', filesArr[i]);
          formData.append('originalnames', filesArr[i].name);
          formData.append('fileSize', filesArr[i].size);
        }
      }
    }
    if (selectedMemberNumber) {
      for (let i = 0; i < selectedMemberNumber.length; i++) {
        formData.append('members', selectedMemberNumber[i]);
      }
    }

    // 카드 생성 버튼 누렀을때 formData에 체크리스트의 내용 넣기.
    let number = 1;
    checklistNo = 0;
    checkListContentArr = [];
    document.querySelectorAll('#checkListContent').forEach((data) => {
      checkListContentArr.push({ num: number, content: data.value, status: 0 });
      number++;
    });
    if (checkListContentArr) {
      for (let i = 0; i < checkListContentArr.length; i++) {
        formData.append('checkList', [checkListContentArr[i].content, 0]);
      }
    }

    formData.append('name', cardTitle);
    formData.append('color', cardColor);
    formData.append('content', cardContent);
    formData.append('sequence', cardSequence);

    CardCreate(cardColumnId, formData);
  });
}

// column delete api
async function BoardColumnDelete(columnId) {
  await $.ajax({
    type: 'DELETE',
    url: `/board-columns/${columnId}?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      ColumnListReorder();
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// column name update api
async function BoardColumnNameUpdate(columnId, name) {
  await $.ajax({
    type: 'PUT',
    url: `/board-columns/${columnId}?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    data: JSON.stringify({ name }),
    success: (data) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        location.reload();
      });
    },
    error: (error) => {
      if (error.status === 308) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message,
        }).then(() => {
          window.location.href = '/block';
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message[0],
        });
      }
    },
  });
}

// card get api
async function CardGet(columnId) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  const result = await $.ajax({
    type: 'GET',
    url: `/cards?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: (data) => {
      return data;
    },
    error: (error) => {
      console.log(error);
    },
  });

  return result;
}

// card create api
async function CardCreate(columnId, data) {
  let updateUserList = [];
  let boardId, cardName;
  const date = new Date(Date.now());
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  await $.ajax({
    type: 'POST',
    url: `/cards?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    processData: false,
    contentType: false,
    data: data,
    success: function (data) {
      boardId = data.boardId;
      cardName = data.cardName;
      if (data.updateUserList) {
        updateUserList = [...data.updateUserList];
      }

      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        location.reload();
      });
    },
    error: (error) => {
      if (error.status === 308) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message,
        }).then(() => {
          window.location.href = '/block';
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message[0],
        });
      }
    },
  });
  if (updateUserList.length) {
    updateUserList.forEach((userId) => {
      socket.emit('inviteCard', {
        userId,
        boardId,
        cardName,
        date: new Date(new Date(date).getTime()),
      });
    });
  }
}

// 코멘트 생성 함수
function createComment(columnId, cardId) {
  const commentInput = document.getElementById('commentInput').value;
  $.ajax({
    type: 'POST',
    url: `/comments?boardColumnId=${columnId}&cardId=${cardId}`,
    data: JSON.stringify({ comment: commentInput }),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: (data) => {
      // 코멘트 생성 후 코멘트 목록을 다시 불러와 화면에 표시
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: '댓글을 생성했습니다.',
      }).then(() => {
        location.reload();
      });
    },
    error: (error) => {
      if (error.status === 308) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message,
        }).then(() => {
          window.location.href = '/block';
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message[0],
        });
      }
    },
  });
}

// "Add Comment" 버튼 클릭 이벤트 처리
document.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'addCommentButton') {
    const columnId = document.getElementById('updateCardButton').getAttribute('data-column-id');
    const cardId = document.getElementById('updateCardButton').getAttribute('data-card-id');
    createComment(columnId, cardId);
  }
});

// 코멘트 디테일 모달을 열기 위한 함수
function openCommentDetailModal(columnId, cardId, commentId) {
  // 코멘트 디테일 정보를 서버에서 가져오는 API 호출
  $.ajax({
    type: 'GET',
    url: `/comments/${commentId}?cardId=${cardId} `,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: function (commentDetail) {
      // 코멘트 디테일 정보를 사용하여 모달을 동적으로 생성
      createCommentDetailModal(commentDetail, columnId, cardId, commentId);
      $('#commentDetailModal').modal('show');
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function createCommentDetailModal(commentDetail, columnId, cardId, commentId) {
  // 모달 내용을 업데이트
  $('#commentDetailModalLabel').text('댓글');
  $('#commentAuthor').text(commentDetail.commentData.user.name); // 모달 제목 업데이트
  $('#commentUpdate').val(commentDetail.commentData.comment); // 코멘트 내용 업데이트

  // 카드 ID와 코멘트 ID를 모달의 삭제 버튼에 설정
  $('#commentDeleteBtn').attr('data-card-id', cardId);
  $('#commentDeleteBtn').attr('data-comment-id', commentId);
  $('#commentUpdateBtn').attr('data-card-id', cardId);
  $('#commentUpdateBtn').attr('data-comment-id', commentId);
  $('#commentUpdateBtn').attr('data-column-id', columnId);
}

function createReplyModal(filteredComments) {
  // 코멘트 목록을 초기화
  const commentList = document.querySelector('#detailCommentBox');
  commentList.innerHTML = ''; // 목록 초기화

  // commentsData를 사용하여 코멘트 목록을 처리
  for (const comment of filteredComments) {
    // 필요한 데이터를 추출하여 모달에 추가
    const isCurrentUserComment = comment.user.id === comment.userId;

    const commentHTML = `
      <div class="checkbox-group d-flex">
        <div class="checkbox-group__single d-flex row">
          <label class="strikethrough" style="color: black;">
            ${comment.user.name}
          </label>
          <textarea class="form-control" rows="3" readonly="" id="replyUpdate${comment.id}" style="resize :none">${
            comment.comment
          }</textarea>
          
          <!-- 수정 버튼 -->
          ${
            isCurrentUserComment
              ? `<button class="btn btn-sm btn-primary edit-comment" data-card-id="${comment.card.id}" data-comment-id="${comment.id}">수정</button>`
              : ''
          }
          
          <!-- 삭제 버튼 -->
          ${
            isCurrentUserComment
              ? `<button class="btn btn-sm btn-danger delete-comment" data-card-id="${comment.card.id}" data-comment-id="${comment.id}">삭제</button>`
              : ''
          }
      <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary" id="replyConfirmBtn${
        comment.id
      }" style="display: none;">확인</button>
        </div>
      </div>
    `;

    // 코멘트 목록에 추가
    commentList.innerHTML += commentHTML;
  }

  // 모달을 표시
  // $('#commentDetailModal').modal('show');

  document.querySelectorAll('.edit-comment').forEach((data) => {
    data.addEventListener('click', (comment) => {
      const commentId = comment.target.getAttribute('data-comment-id');
      const cardId = comment.target.getAttribute('data-card-id');
      // // textarea를 편집 가능하게 변경
      const replyTextarea = $(`#replyUpdate${commentId}`); // 수정된 부분
      replyTextarea.removeAttr('readonly');
      // 확인 버튼을 보이게 함
      document.getElementById(`replyConfirmBtn${commentId}`).style.display = 'inline-block';

      // 확인 버튼 클릭 이벤트 처리
      document.getElementById(`replyConfirmBtn${commentId}`).addEventListener('click', function () {
        const columnId = document.getElementById('commentUpdateBtn').getAttribute('data-column-id');
        // textarea를 읽기 전용으로 변경
        const replyTextarea = $(`#replyUpdate${commentId}`); // 수정된 부분
        const updatedReply = replyTextarea.val(); // 수정된 부분
        replyTextarea.attr('readonly', 'readonly'); // 수정된 부분
        // 확인 버튼을 숨김
        $(`.replyConfirmBtn${commentId}`).hide();

        CommentUpdate(commentId, columnId, cardId, { comment: updatedReply });
      });
    });
  });

  document.querySelectorAll('.delete-comment').forEach((data) => {
    data.addEventListener('click', (comment) => {
      const commentId = comment.target.getAttribute('data-comment-id');
      const cardId = comment.target.getAttribute('data-card-id');

      deleteConfirmModal(commentId, cardId, 'comment');
    });
  });
}

document.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'commentDetail') {
    $('#exampleModal').modal('hide');
    document.querySelector('#detailCommentBox').innerHTML = '';
    const commentId = event.target.getAttribute('data-commentId');
    const cardId = event.target.getAttribute('data-cardId');
    const columnId = document.getElementById('updateCardButton').getAttribute('data-column-id');
    Getcomment(cardId, commentId);
    openCommentDetailModal(columnId, cardId, commentId);
  }
});

// 카드 세부 정보 모달을 생성하는 함수
function createCardDetailModal(cardData, commentsData, columnId, cardId, users) {
  $('#checkListViewBox').hide();
  // 멤버 리스트의 HTML을 생성
  let membersHTML = '';
  selectedMembers = [];
  selectedMemberNumber = [];
  if (users) {
    for (const member of users) {
      let Img = member[0].profileUrl ? member[0].profileUrl : '/assets/img/favicon.png';
      membersHTML += `
      <div class="checkbox-group d-flex">
        <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex">
          <img src="${Img}" style="border-radius: 50%; width: 30px; height: 30px; margin-right: 3%;">
            <label for="check-grp-${member[0].userId}" class="strikethrough" style="width: 50px;">
              ${member[0].name}
            </label>
        </div>
      </div>
      `;

      selectedMembers.push({ name: member[0].name, id: member[0].userId });
      selectedMemberNumber.push(member[0].userId);
    }
  }

  let commentHTML = '';
  for (const comment of commentsData) {
    // reply_id가 없는 코멘트만 처리
    if (!comment.reply_id) {
      const cardId = cardData.id;
      const commentId = comment.id;

      commentHTML += `
        <div class="checkbox-group d-flex">
          <div class="checkbox-group__single d-flex row">
            <label class="strikethrough" style="color: black;">
              ${comment.user.name}
            </label>
            <p> ${comment.comment} </p>
          </div>
          <button class="add-card-btn" id="commentDetail" data-cardId="${cardId}" data-commentId="${commentId}">상세 보기</button>
        </div> `;
    }
  }
  let fileHTML = '';
  if (cardData.file_url) {
    if (cardData.file_url.length > 1) {
      for (let i in cardData.file_url) {
        fileHTML += `<a href="${cardData.file_url[i]}" download=""> ${cardData.file_original_name[i]} </a><br>`;
      }
    } else if (cardData.file_url[0]) {
      fileHTML += `<a href="${cardData.file_url}" download=""> ${cardData.file_original_name} </a><br>`;
    }
  }
  let checkListHTML = '';
  if (cardData.check_list) {
    if (typeof cardData.check_list != 'string' && cardData.check_list.length > 0) {
      for (let i in cardData.check_list) {
        const checklist = cardData.check_list[i].split(',');
        let check;
        if (checklist[checklist.length - 1] == 1) {
          check = 'checked';
        } else {
          check = '';
        }
        for (let j = 1; j < checklist.length - 1; j) {
          checklist[0] += ',' + checklist[j];
          checklist.splice(j, 1);
        }
        checkListHTML += `<li style="margin-bottom: 3%;">
                            <div class="checkbox-group d-flex">
                              <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex" id="check-list-view" data-cardId=${cardId}>
                                  <input class="checkbox" type="checkbox" id="check-grp-${String(cardId) + i}" ${check}>
                                  <label for="check-grp-${String(cardId) + i}" class=" strikethrough">
                                    ${checklist[0]}
                                  </label>
                              </div>
                            </div>
                        </li>`;
      }
    } else if (typeof cardData.check_list == 'string') {
      const checklist = cardData.check_list.split(',');
      let check;
      if (checklist[checklist.length - 1] == 1) {
        check = 'checked';
      } else {
        check = '';
      }
      for (let j = 1; j < checklist.length - 1; j) {
        checklist[0] += ',' + checklist[j];
        checklist.splice(j, 1);
      }
      checkListHTML += `<li style="margin-bottom: 3%;">
                          <div class="checkbox-group d-flex">
                            <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex" id="check-list-view" data-cardId=${cardId}>
                                <input class="checkbox" type="checkbox" id="check-grp-${String(cardId) + 1}" ${check}>
                                <label for="check-grp-${String(cardId) + 1}" class=" strikethrough">
                                ${checklist[0]}
                                </label>
                            </div>
                          </div>
                      </li>`;
    }
    $('#editCheckListStatus').show();
  } else {
    $('#editCheckListStatus').hide();
  }
  const buttons = `<div class="kanban-modal__header">
    <h5 class="modal-title" id="exampleModalLabel">${cardData.name}</h5>
 </div>
 <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary"
       id="updateCardButton"
       data-column-id="${columnId}"
       data-card-id="${cardData.id}"
       data-bs-dismiss="modal">수정</button>
<button class="btn btn-primary btn-sm btn-squared btn-transparent-primary"
id="cardDeleteBtn" data-column-id="${columnId}" data-card-id="${cardData.id}" onclick="deleteConfirmModal(${columnId}, ${cardData.id}, 'card')">삭제</button>
<button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
<img src="./assets/img/svg/x.svg" alt="x" class="svg">
</button>`;
  document.querySelector('#commentBox').innerHTML = commentHTML;
  document.querySelector('#cardDetailMembers').innerHTML = membersHTML;
  document.querySelector('#cardDetailImgFile').innerHTML = fileHTML;
  document.querySelector('#cardDetailDescription').value = cardData.content;
  document.querySelector('#cardDetailButtons').innerHTML = buttons;
  document.querySelector('#editCheckListStatus').setAttribute('data-cardId', cardId);
  document.querySelector('#checkListViewBox').children[1].innerHTML = checkListHTML;

  // 모달을 화면에 표시
  $('#exampleModal').modal('show');
}

// 멤버 찾기 workspace에서 붙여옴
let typingTimer;
let selectedMembers = [];
let selectedMemberNumber = [];

function initializeMemberInput(inputSelector, memberListSelector, selected) {
  const memberInput = document.querySelector(inputSelector);
  const selectedMemberList = document.querySelector(memberListSelector);

  memberInput.addEventListener('click', async (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
      const results = await searchMembers();

      selectedMemberList.innerHTML = '';
      for (let result of results) {
        let Img = result.profileUrl ? result.profileUrl : '/assets/img/favicon.png';
        let data = `<li>
                          <a href="#">
                            <img class="rounded-circle wh-34 bg-opacity-secondary" src="${Img}" alt="${result.name}">
                          </a>
                          <span>${result.name}</span>
                        </li>`;
        const li = document.createElement('li');
        li.innerHTML = data;
        selectedMemberList.appendChild(li);

        updateSelectedMembersUI(selected);
        li.addEventListener('click', () => {
          if (!selectedMemberNumber.includes(result.userId)) {
            selectedMembers.push({ name: result.name, id: result.userId });
            selectedMemberNumber.push(result.userId);
            updateSelectedMembersUI(selected);
          }
        });
      }
    });
  });
}

// 유저검색
async function searchMembers() {
  try {
    const { boardMembers } = await $.ajax({
      method: 'GET',
      url: `/boards/${boardId}/members`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });
    return boardMembers;
  } catch (err) {
    console.error(err);
  }
}

// 선택한 멤버 UI 출력
function updateSelectedMembersUI(selected) {
  const selectedMemberList = document.querySelector(selected);
  selectedMemberList.innerHTML = selectedMembers
    .map(
      (member) => `
    <li>${member.name} <span class="remove-member" data-member="${member.id}">x</span></li>
  `
    )
    .join('');

  // 재선택 시 삭제
  const removeIcons = selectedMemberList.querySelectorAll('.remove-member');
  removeIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
      const memberRemove = e.target.getAttribute('data-member');
      selectedMembers = selectedMembers.filter((name) => name.id !== memberRemove);
      selectedMemberNumber = selectedMemberNumber.filter((id) => id !== memberRemove);
      updateSelectedMembersUI(selected);
    });
  });
}

// 카드 세부 정보와 코멘트를 가져오는 함수
async function DetailCardGet(columnId, cardId) {
  // 카드 세부 정보를 가져오는 API 호출
  const cardResponse = await $.ajax({
    type: 'GET',
    url: `/cards/${cardId}?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
  });

  // 카드 세부 정보 응답
  const cardData = cardResponse;

  const users = [];
  for (let i in cardData.members) {
    const { boardMembers } = await $.ajax({
      type: 'GET',
      url: `/boards/${boardId}/members/${cardData.members[i]}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
      },
      success: (data) => {},
    });
    users.push(boardMembers);
  }

  // 카드에 대한 코멘트를 가져오는 API 호출
  const commentsResponse = await $.ajax({
    type: 'GET',
    url: `/comments?cardId=${cardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
  });

  // 코멘트 응답
  const commentsData = commentsResponse;
  createCardDetailModal(cardData, commentsData, columnId, cardId, users);
  openUpdateCardModal(cardData, columnId, cardId);
}

// 체크리스트 상태 수정 버튼
document.querySelector(`#editCheckListStatus`).addEventListener('click', async (btn) => {
  let checklist = [];
  let checklistCardId = btn.target.getAttribute('data-cardId');

  document.querySelectorAll('#check-list-view').forEach((data) => {
    let status = 0;
    if (data.children[0].checked) {
      status = 1;
    }
    checklist.push(`${data.children[1].outerText},${status}`);
  });
  // 여기서 부터 작업 -- 체크리스트 상태 변경 api가 필요.

  await $.ajax({
    type: 'PUT',
    url: `cards/${checklistCardId}/checklistStatus`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ checkList: checklist }),
    success: () => {
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
});

// card sequence update api
async function CardSequenceUpdate(columnId, cardId, sequence) {
  $.ajax({
    type: 'PUT',
    url: `cards/${cardId}/sequence?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ sequence }),
    success: (data) => {},
    error: (error) => {
      console.log(error);
    },
  });
}

// 업데이트 모달을 열기 위한 함수
function openUpdateCardModal(cardData, columnId, cardId) {
  // 모달 내부의 필드들을 초기화 (빈 값으로)
  document.getElementById('cardTitleUpdate').value = cardData.name;
  document.getElementById('cardContentUpdate').value = cardData.content;
  // document.getElementById('cardfileUpdate').value = '';
  document.getElementById('cardUpdateMembers').innerHTML = cardData.members;
  document.getElementById('cardColorUpdate').value = cardData.color;
  // 컬럼 아이디와 카드 아이디를 모달의 data 속성에 설정
  document.getElementById('updateCardButton').setAttribute('data-column-id', columnId);
  document.getElementById('updateCardButton').setAttribute('data-card-id', cardId);

  // 초기화
  document.querySelector('#edit-card-input').value = '';
  filesArr = [];
  filesNameArr = [];
  filesSizeArr = [];
  fileNo = 0;
  document.querySelector('#edit-card-file').innerHTML = '';
  if (cardData.file_url) {
    if (cardData.file_url.length > 1) {
      for (let i = 0; i < cardData.file_url.length; i++) {
        // 목록 추가
        let htmlData = '';
        htmlData += '<div id="file' + fileNo + '" class="filebox">';
        htmlData += '   <p class="name">' + cardData.file_original_name[i] + '</p>';
        htmlData +=
          '   <a class="delete" onclick="deleteFile(' + fileNo + ');"><i class="far fa-minus-square"></i></a>';
        htmlData += '</div>';
        $('.file-list').append(htmlData);
        filesArr.push(cardData.file_url[i]);
        filesNameArr.push(cardData.file_original_name[i]);
        filesSizeArr.push(cardData.file_size[i]);
        fileNo++;
      }
    } else if (cardData.file_url.length == 1) {
      // 목록 추가
      let htmlData = '';
      htmlData += '<div id="file' + fileNo + '" class="filebox">';
      htmlData += '   <p class="name">' + cardData.file_original_name + '</p>';
      htmlData += '   <a class="delete" onclick="deleteFile(' + fileNo + ');"><i class="far fa-minus-square"></i></a>';
      htmlData += '</div>';
      $('.file-list').append(htmlData);
      filesArr.push(cardData.file_url[0]);
      filesNameArr.push(cardData.file_original_name);
      filesSizeArr.push(cardData.file_size[0]);
      fileNo++;
    }
  }

  // 체크리스트 초기화 및 저장된 데이터 뿌려주기.
  // 데이터를 받아와서 값 뿌려주기. , for문을 돌려 checklistNo++
  // 여기선 저장된 값들을 뿌려주는 곳이니 놔두고
  // get 에서 해야지: check box가 checked면 1, 아니면 0, check cancel이면 2? -> 2는 일단 보류
  checklistNo = 0;
  checkListContentArr = [];
  const checkBox = document.querySelector('#editCheckListBox').children[1];
  checkBox.innerHTML = '';
  $('#editCheckListBox').hide();

  if (cardData.check_list) {
    if (typeof cardData.check_list != 'string' && cardData.check_list.length > 0) {
      for (let i in cardData.check_list) {
        const checklist = cardData.check_list[i].split(',');
        for (let j = 1; j < checklist.length - 1; j) {
          checklist[0] += ',' + checklist[j];
          checklist.splice(j, 1);
        }
        const num = ++checklistNo;
        const checkListHTML = `<li id="checkList${num}">
                                <div class="mb-30" style="margin-top: 5%" >
                                  <input type="text" id="checkListEditContent" data-status=${
                                    checklist[checklist.length - 1]
                                  } value="${checklist[0]}"/>
                                  <a class="delete" onclick="deleteCheckList(${num})"><i class="far fa-minus-square"></i></a>
                                </div>
                              </li>`;
        checkBox.innerHTML += checkListHTML;
      }
    } else if (typeof cardData.check_list == 'string') {
      const checklist = cardData.check_list.split(',');
      for (let j = 1; j < checklist.length - 1; j) {
        checklist[0] += ',' + checklist[j];
        checklist.splice(j, 1);
      }
      const num = ++checklistNo;
      const checkListHTML = `<li id="checkList${num}">
                                <div class="mb-30" style="margin-top: 5%" >
                                  <input type="text" id="checkListEditContent" data-status=${
                                    checklist[checklist.length - 1]
                                  } value="${checklist[0]}"/>
                                  <a class="delete" onclick="deleteCheckList(${num})"><i class="far fa-minus-square"></i></a>
                                </div>
                              </li>`;
      checkBox.innerHTML += checkListHTML;
    }
  }
}

document.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'updateCardButton') {
    $('#updateCardModal').modal('show');
  }
});

document.getElementById('CardUpdateBtn').addEventListener('click', () => {
  // 컬럼 아이디와 카드 아이디 가져오기
  const columnId = document.getElementById('updateCardButton').getAttribute('data-column-id');
  const cardId = document.getElementById('updateCardButton').getAttribute('data-card-id');

  // 업데이트할 데이터 수집
  const updatedCardName = document.getElementById('cardTitleUpdate').value;
  const updatedCardContent = document.getElementById('cardContentUpdate').value;

  // 멤버는 이미 선택된 것을 사용하므로 selectedMemberNumber를 그대로 사용
  const updatedCardColor = document.getElementById('cardColorUpdate').value;

  let number = 1;
  document.querySelectorAll('#checkListEditContent').forEach((data) => {
    checkListContentArr.push({ num: number, content: data.value, status: data.getAttribute('data-status') });
    number++;
  });
  // 폼데이터 담기
  let form = document.querySelector('form');
  const updatedData = new FormData(form);

  let i = 0;
  let count = 0;
  if (filesNameArr) {
    for (i = 0; i < filesNameArr.length; i++) {
      // 삭제되지 않은 파일만 폼데이터에 담기
      if (typeof filesArr[i] == 'object') {
        if (document.getElementById(`file${i}`)) {
          updatedData.append('newFiles', filesArr[i]);
          updatedData.append('originalnames', filesNameArr[i]);
          updatedData.append('fileSize', filesSizeArr[i]);
        }
      } else {
        if (document.getElementById(`file${i}`)) {
          updatedData.append('alreadyFiles', filesArr[i]);
          updatedData.append('alreadyFileNames', filesNameArr[i]);
          updatedData.append('alreadyfileSize', filesSizeArr[i]);
          count++;
        }
      }
    }
  }
  if (selectedMemberNumber) {
    for (let j = 0; j < selectedMemberNumber.length; j++) {
      updatedData.append('members', selectedMemberNumber[j]);
    }
  }

  if (checkListContentArr.length > 0) {
    console.log(checkListContentArr);
    for (let i = 0; i < checkListContentArr.length; i++) {
      updatedData.append('checkList', [checkListContentArr[i].content, checkListContentArr[i].status]);
    }
  } else {
    updatedData.append('checkList', []);
  }
  updatedData.append('name', updatedCardName);
  updatedData.append('color', updatedCardColor);
  updatedData.append('content', updatedCardContent);
  updatedData.append('alreadyFileCount', count);

  // 업데이트 함수 호출
  CardAllUpdate(columnId, cardId, updatedData);
  // window.location.reload();
});

// card update api
async function CardAllUpdate(columnId, cardId, data) {
  let updateUserList = [];
  let boardId, cardName;
  const date = new Date(Date.now());
  // PATCH 요청을 보내기 전에 데이터 확인
  await $.ajax({
    type: 'PATCH',
    url: `/cards/${cardId}?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    processData: false,
    contentType: false,
    data: data,
    success: function (data) {
      boardId = data.boardId;
      cardName = data.cardName;
      if (data.updateUserList) {
        updateUserList = [...data.updateUserList];
      }
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        location.reload();
      });
    },
    error: (error) => {
      if (error.status === 308) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message,
        }).then(() => {
          window.location.href = '/block';
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message[0],
        });
      }
    },
  });
  if (updateUserList.length) {
    updateUserList.forEach((userId) => {
      socket.emit('inviteCard', {
        userId,
        boardId,
        cardName,
        date: new Date(new Date(date).getTime()),
      });
    });
  }
}

// 삭제 확인 모달 출력
function deleteConfirmModal(targetId, targetId2, targetType) {
  const confirmModal = document.querySelector('#modal-info-confirmed');
  $(confirmModal).modal('show');

  const okBtn = confirmModal.querySelector('.btn-info');
  const cancelBtn = confirmModal.querySelector('.btn-light');

  okBtn.addEventListener('click', async () => {
    if (targetType === 'card') {
      deleteCard(targetId, targetId2);
    } else if (targetType === 'column') {
      BoardColumnDelete(targetId);
    } else if (targetType === 'comment') {
      deleteComment(targetId, targetId2);
    }
    $(confirmModal).modal('hide');
  });

  cancelBtn.addEventListener('click', () => {
    $(confirmModal).modal('hide');
  });
}

// 함수 내에서 카드 삭제를 처리하는 로직
function deleteCard(columnId, cardId) {
  // 카드 삭제 API 호출
  $.ajax({
    type: 'DELETE',
    url: `/cards/${cardId}?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      // 삭제 성공 후, 페이지 새로고침
      window.location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

function deleteComment(commentId, cardId) {
  // 카드 삭제 API 호출
  $.ajax({
    type: 'DELETE',
    url: `/comments/${commentId}?cardId=${cardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

document.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'commentDeleteBtn') {
    const commentId = document.getElementById('commentDeleteBtn').getAttribute('data-comment-id');
    const cardId = document.getElementById('commentDeleteBtn').getAttribute('data-card-id');
    deleteConfirmModal(commentId, cardId, 'comment');
  }
});

// comment update api
async function CommentUpdate(commentId, columnId, cardId, data) {
  await $.ajax({
    type: 'PATCH',
    url: `/comments/${commentId}?boardColumnId=${columnId}&cardId=${cardId}`,
    data: JSON.stringify({
      comment: data.comment,
    }),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: function (data) {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: '댓글을 수정하였습니다.',
      }).then(() => {
        location.reload();
      });
    },
    error: (error) => {
      if (error.status === 308) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message,
        }).then(() => {
          window.location.href = '/block';
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message[0],
        });
      }
    },
  });
}

// 업데이트 버튼 클릭 시 호출되는 함수
document.getElementById('commentUpdateBtn').addEventListener('click', function () {
  // textarea를 편집 가능하게 변경
  const commentTextarea = document.getElementById('commentUpdate');
  commentTextarea.removeAttribute('readonly');
  // 확인 버튼을 보이게 함
  document.getElementById('commentConfirmBtn').style.display = 'inline-block';
});

// 확인 버튼 클릭 시 호출되는 함수
document.getElementById('commentConfirmBtn').addEventListener('click', function () {
  // textarea를 읽기 전용으로 변경
  const commentTextarea = document.getElementById('commentUpdate');
  commentTextarea.setAttribute('readonly', 'readonly');
  // 확인 버튼을 다시 숨김
  document.getElementById('commentConfirmBtn').style.display = 'none';

  // 수정된 코멘트 가져오기
  const updatedComment = commentTextarea.value;

  // commentId와 cardId 가져오기
  const commentId = document.getElementById('commentUpdateBtn').getAttribute('data-comment-id');
  const cardId = document.getElementById('commentUpdateBtn').getAttribute('data-card-id');
  const columnId = document.getElementById('commentUpdateBtn').getAttribute('data-column-id');

  // 수정된 코멘트와 함께 CommentUpdate 함수 호출
  CommentUpdate(commentId, columnId, cardId, { comment: updatedComment });
});

// 대댓글 생성 함수
function createreply(columnId, cardId, reply_id, replayComment) {
  const comment = {
    comment: replayComment,
    reply_id: reply_id,
  };

  $.ajax({
    type: 'POST',
    url: `/comments?boardColumnId=${columnId}&cardId=${cardId}`,
    data: JSON.stringify(comment),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: (data) => {
      // 입력란 비우고 숨김
      document.getElementById('replayComment').value = '';
      const commentAddBox = document.getElementById('commentAddBox');
      commentAddBox.style.display = 'none';
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: '댓글을 생성하였습니다.',
      }).then(() => {
        location.reload();
      });
    },
    error: (error) => {
      if (error.status === 308) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message,
        }).then(() => {
          window.location.href = '/block';
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: error.responseJSON.message[0],
        });
      }
    },
  });
}

// "답글 추가" 버튼 클릭 시 호출되는 함수
document.getElementById('replayCommentButton').addEventListener('click', function () {
  // "replayComment" textarea의 내용 가져오기
  const replayComment = document.getElementById('replayComment').value;

  const commentId = document.getElementById('commentUpdateBtn').getAttribute('data-comment-id');
  const cardId = document.getElementById('commentUpdateBtn').getAttribute('data-card-id');
  const columnId = document.getElementById('commentUpdateBtn').getAttribute('data-column-id');
  const reply_id = commentId;

  // 댓글 작성을 원하는 commentId와 replayComment 데이터를 사용하여 댓글을 추가하는 함수 호출
  createreply(columnId, cardId, reply_id, replayComment);
});

function Getcomment(cardId, commentId) {
  // 코멘트 디테일 정보를 서버에서 가져오는 API 호출
  $.ajax({
    type: 'GET',
    url: `/comments?cardId=${cardId} `,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: function (comments) {
      const filteredComments = comments.filter(function (comment) {
        return comment.reply_id === Number(commentId);
      });
      if (filteredComments.length > 0) {
        // 필터링된 모든 코멘트를 사용하여 모달을 동적으로 생성
        createReplyModal(filteredComments);
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
}

// 여러 파일 보내기
var fileNo = 0;
var filesArr = [];
let filesNameArr = [];
let filesSizeArr = [];

/* 첨부파일 추가 */
function addFile(obj) {
  var maxFileCnt = 5; // 첨부파일 최대 개수
  var attFileCnt = filesArr.length; // 기존 추가된 첨부파일 개수
  var remainFileCnt = maxFileCnt - attFileCnt; // 추가로 첨부가능한 개수
  var curFileCnt = obj.files.length; // 현재 선택된 첨부파일 개수

  // 첨부파일 개수 확인
  if (curFileCnt > remainFileCnt) {
    alert('첨부파일은 최대 ' + maxFileCnt + '개 까지 첨부 가능합니다.');
  }

  for (var i = 0; i < Math.min(curFileCnt, remainFileCnt); i++) {
    const file = obj.files[i];
    // 첨부파일 검증
    if (validation(file)) {
      // 파일 배열에 담기
      var reader = new FileReader();
      reader.onload = function () {
        filesArr.push(file);
      };
      reader.readAsDataURL(file);
      filesNameArr.push(file.name);
      filesSizeArr.push(file.size);

      // 목록 추가
      let htmlData = '';
      htmlData += '<div id="file' + fileNo + '" class="filebox">';
      htmlData += '   <p class="name">' + file.name + '</p>';
      htmlData += '   <a class="delete" onclick="deleteFile(' + fileNo + ');"><i class="far fa-minus-square"></i></a>';
      htmlData += '</div>';
      $('.file-list').append(htmlData);
      fileNo++;
    } else {
      continue;
    }
  }
  // 초기화
  document.querySelector('input[type=file]').value = '';
}

/* 첨부파일 검증 */
function validation(obj) {
  if (obj.name.length > 100) {
    alert('파일명이 100자 이상인 파일은 제외되었습니다.');
    return false;
  } else if (obj.size > 10 * 1024 * 1024) {
    alert('최대 파일 용량인 10MB를 초과한 파일은 제외되었습니다.');
    return false;
  } else if (obj.name.lastIndexOf('.') == -1) {
    alert('확장자가 없는 파일은 제외되었습니다.');
    return false;
  } else {
    return true;
  }
}

/* 첨부파일 삭제 */
function deleteFile(num) {
  document.querySelector(`#file${num}`).remove();
  filesArr[num].is_delete = true;
  filesNameArr[num].is_delete = true;
  filesSizeArr[num].is_delete = true;
}

// 헤더에 있는 검색창
let searchInput = '';

// 전체 화면일땐 이부분을 사용하는데
document.querySelector('.search-form-topMenu').addEventListener('submit', (event) => {
  event.preventDefault();
  searchInput = document.querySelector('#header-search').value;
  document.querySelector('.search-form-topMenu').classList.remove('show');
  document.querySelector('.search-toggle').classList.remove('active');
  if (searchInput) {
    document.querySelector('.search-result').innerHTML = `검색 결과: ${searchInput}`;
  } else {
    document.querySelector('.search-result').innerHTML = '';
  }
  document.querySelector('#header-search').value = '';
  BoardColumnsGet(searchInput);
});

//화면을 줄이면 이부분을 사용함
document.querySelector('.search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  searchInput = document.querySelector('#search-form').value;
  document.querySelector('.mobile-search').classList.remove('show');
  document.querySelector('.btn-search').classList.remove('search-active');
  document.querySelector('#search-form').value = '';
  if (searchInput) {
    document.querySelector('.mobile-search-result').innerHTML = `검색 결과: ${searchInput}`;
  } else {
    document.querySelector('.mobile-search-result').innerHTML = '';
  }
  BoardColumnsGet(searchInput);
});

// 카드 생성 때 체크리스트 보이기 및 가리기
document.querySelectorAll('#checkListBoxOnOff').forEach((data) => {
  data.addEventListener('click', () => {
    if ($('#checkListBox').css('display') == 'none') {
      $('#checkListBox').show();
    } else {
      $('#checkListBox').hide();
    }
  });
});

// 카드 생성시 체크리스트 추가하기 카드 생성하는 곳으로 이동해야할듯
let checkListContentArr = [];
let checklistNo = 0;
document.querySelector('#addCheckList').addEventListener('click', () => {
  const checkBox = document.querySelector('#checkListBox').children[1];

  const num = ++checklistNo;
  const checkListHTML = `<li id="checkList${num}">
                          <div class="mb-30" style="margin-top: 5%" >
                            <input type="text" id="checkListContent"/>
                            <a class="delete" onclick="deleteCheckList(${num})"><i class="far fa-minus-square"></i></a>
                          </div>
                        </li>`;
  checkBox.innerHTML += checkListHTML;
});

/* 체크리스트 삭제 */
function deleteCheckList(num) {
  document.querySelector(`#checkList${num}`).remove();
  checkListContentArr = checkListContentArr.filter((data) => data.num != num);
}

// 카드 조회 때 체크리스트 보이기 및 가리기
document.querySelectorAll('#checkListViewBoxOnOff').forEach((data) => {
  data.addEventListener('click', () => {
    if ($('#checkListViewBox').css('display') == 'none') {
      $('#checkListViewBox').show();
    } else {
      $('#checkListViewBox').hide();
    }
  });
});

// 카드 수정 시 체크리스트 버튼
document.querySelectorAll('#editCheckListBoxOnOff').forEach((data) => {
  data.addEventListener('click', () => {
    if ($('#editCheckListBox').css('display') == 'none') {
      $('#editCheckListBox').show();
    } else {
      $('#editCheckListBox').hide();
    }
  });
});

// 카드 수정시 체크리스트 추가
document.querySelectorAll('#addEditCheckList').forEach((data) => {
  data.addEventListener('click', () => {
    const checkBox = document.querySelector('#editCheckListBox').children[1];

    const num = ++checklistNo;
    const checkListHTML = `<li id="checkList${num}">
                            <div class="mb-30" style="margin-top: 5%" >
                              <input type="text" id="checkListEditContent" data-status=0/>
                              <a class="delete" onclick="deleteCheckList(${num})"><i class="far fa-minus-square"></i></a>
                            </div>
                          </li>`;
    checkBox.innerHTML += checkListHTML;
  });
});
