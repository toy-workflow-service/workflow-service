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

// -----------------여기서부터 작업함--------------------
let boardId = new URLSearchParams(window.location.search).get('boardId');
// boardId = Number(boardId);
// boardId = 65;

// $(init);
$(BoardColumnsGet);

function init() {
  $('.kanban-items,.todo-task1 tbody')
    .sortable({
      connectWith: '.kanban-items,.todo-task1 tbody',
      stack: '.kanban-items  ul,.todo-task1 tbody',
      start: function (e, i) {
        // console.log('start : ', e, i);
      },
      stop: function (e, i) {
        // console.log('stop : ', e, i);
        CardListReorder();
      },
    })
    .disableSelection();
  $('.kanban-container,.todo-task2 tbody')
    .sortable({
      connectWith: '.kanban-container,.todo-task2 tbody ',
      stack: '.kanban-container,.todo-task2 tbody',
      start: function (e, i) {
        // console.log('start : ', e, i);
      },
      stop: function (e, i) {
        // console.log('stop : ', e, i);
        ColumnListReorder();
      },
    })
    .disableSelection();
}

// 바뀐 순서 출력 (여기서 순서 update api 사용할듯)
function ColumnListReorder() {
  const columns = document.querySelectorAll('.kanban-list');
  Object.values(columns).forEach(async (column, index) => {
    // console.log('testest: ', column, index + 1);
    // console.log('columnId : ', column.getAttribute('data-columnid'));
    const columnId = column.getAttribute('data-columnid');
    if (columnId != 0) {
      //컬럼 순서 저장
      const sequence = Number(index) + 1;
      await BoardColumnSequenceUpdate(columnId, sequence);
    }
  });
  // console.dir($('.kanban-list'));
}

function CardListReorder() {
  const cards = document.querySelectorAll('#card-list-item');
  Object.values(cards).forEach(async (card, index) => {
    const columnId = card.parentElement.getAttribute('data-columnId');
    const cardId = card.getAttribute('data-cardid');
    await CardSequenceUpdate(columnId, cardId, index + 1);
  });
  // console.log($('.list-items').children('li'));
  // console.dir($('.list-items'));
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
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get column API
async function BoardColumnsGet() {
  await $.ajax({
    type: 'GET',
    url: `/board-columns?boardId=${boardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: async (data) => {
      BoardColumns(data);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get board column, card getHtml
// 아직 card api가 없기 때문에 column만 일단 넣음
let cardIndex = 0;
async function BoardColumns(data) {
  document.querySelector(
    '.breadcrumb-main'
  ).innerHTML = `<h4 class="text-capitalize breadcrumb-title">${data[0].boardName}</h4>
                <div class="breadcrumb-action justify-content-center flex-wrap">
                  <nav aria-label="breadcrumb">
                      <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/"><i class="uil uil-estate"></i>Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">work-flow Board</li>
                      </ol>
                  </nav>
                </div>`;
  document.querySelector('.kanban-header').innerHTML = `<h4>${data[0].boardName}</h4>`;

  const kanbanList = document.querySelector('.kanban-container');
  kanbanList.innerHTML = '';
  let i = 0;
  for (i in data) {
    const card = await CardGet(data[i].columnId);
    const cardHtml = card
      .map(
        (c) =>
          `<li class="d-flex justify-content-between align-items-center " draggable="true" id="card-list-item" data-columnId=${data[i].columnId} data-cardId=${c.id} style="border:1px solid ${c.color}; background-color: ${c.color}10; font-weight: bold">
                                        ${c.name}
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
                                  </li>`
      )
      .join('');
    cardIndex += Number(card.length);
    if (data[i].columnName == 'Done') {
      kanbanList.innerHTML += `<div class="list kanban-list draggable" draggable="true" data-columnId=${data[i].columnId}>
                                  <div class="kanban-tops list-tops">
                                    <div class="d-flex justify-content-between align-items-center py-10">
                                        <h3 class="list-title">${data[i].columnName}</h3>
                                    </div>
                                  </div>  
                                  <div id="cardListItems${data[i].columnId}">
                                    <ul class="kanban-items list-items  drag-drop " style="min-height: 50px; max-height: 350px" data-columnId="${data[i].columnId}">
                                    ${cardHtml}
                                    </ul>
                                    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${data[i].columnId}" data-index="${cardIndex}"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a
                                    card</button>
                                  </div>
  
                                </div>`;
    } else {
      kanbanList.innerHTML += `<div class="list kanban-list draggable" draggable="true" data-columnId=${data[i].columnId}>
                                  <div class="kanban-tops list-tops">
                                    <div class="d-flex justify-content-between align-items-center py-10">
                                        <h3 class="list-title">${data[i].columnName}</h3>
                                        <div class="dropdown dropdown-click">
                                          <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                              <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                          </button>
                                          <div class="dropdown-default dropdown-bottomRight dropdown-menu" style="">
                                              <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#updateColumnModal" id="updateColumnTitle" data-value="${data[i].columnId}" data-title="${data[i].columnName}">Edit Column Title</a>
                                              <a class="dropdown-item" id="ColumnDeleteBtn" value="${data[i].columnId}">Delete Column</a>
                                          </div>
                                        </div>
                                    </div>
                                  </div>
  
                                  <div id="cardListItems${data[i].columnId}">
                                    <ul class="kanban-items list-items  drag-drop " style="min-height: 50px; max-height: 350px" data-columnId="${data[i].columnId}">
                                    ${cardHtml}       
                                    </ul>
                                    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${data[i].columnId}" data-index="${cardIndex}"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a
                                    card</button>
                                  </div>
  
                                </div>`;
    }
    console.log(cardIndex);
  }
  kanbanList.innerHTML += `<div class="kanban-list list draggable" draggable="true" data-columnId=0>
                            <div class="list__add-card">
                              <div class="kanban-board__add-card">
                                  <button class="shadow-none border-0" data-bs-toggle="modal" data-bs-target="#editColumnModal"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg">
                                    Add
                                    column</button>
                              </div>
                            </div>
                          </div>`;

  init();
  // column add button click
  document.getElementById('ColumnAddBtn').addEventListener('click', (a) => {
    // Number(i) + 1 -> sequence
    const columnTitle = document.getElementById('columnTitle').value;
    console.log('BoardColumns in sequence, columTitle : ', a, Number(i) + 1, columnTitle);
    BoardColumnsCreate(columnTitle, Number(i) + 1);
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
      success: function (data) {
        console.log(data.message);
        location.reload();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //column delete button click
  document.querySelectorAll('#ColumnDeleteBtn').forEach((data) => {
    data.addEventListener('click', async (e) => {
      const columnId = e.target.getAttribute('value');
      await BoardColumnDelete(columnId);
    });
  });

  // column delete api
  async function BoardColumnDelete(columnId) {
    $.ajax({
      type: 'DELETE',
      url: `/board-columns/${columnId}?boardId=` + boardId,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        console.log(data.message);
        ColumnListReorder();
        location.reload();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

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

  document.getElementById('ColumnUpdateNameBtn').addEventListener('click', async () => {
    const columnTitle = document.getElementById('columnTitleUpdate').value;
    await BoardColumnNameUpdate(columnId, columnTitle);
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
      console.log(columnId, cardId);
    });
  });

  // 댓글 모달창이 열리면 해당하는 대댓글과 댓글 값 뿌려주기
  document.querySelectorAll('#commentDetail').forEach((data) => {
    data.addEventListener('click', (e) => {
      const cardId = e.target.getAttribute('data-cardId');
      const commentId = e.target.getAttribute('data-commentId');
      columnId = e.target.getAttribute('data-columnId');
    });
  });

  // CardUpdateBtn 버튼 클릭 시
  document.getElementById('CardUpdateBtn').addEventListener('click', async () => {
    // 수정 된값이 db로 넘어가야함.
    console.log('update btn check');
    // await CardAllUpdate(columnId, cardId, data)
  });

  // cardDeleteBtn 클릭 시
  document.getElementById('cardDeleteBtn').addEventListener('click', async () => {
    console.log('delete btn check');
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
      console.log('sequence, columnId', cardSequence, cardColumnId);
    });
  });
  document.getElementById('CardCreateBtn').addEventListener('click', () => {
    const cardTitle = document.getElementById('cardTitleCreate').value;
    const cardColor = document.getElementById('cardColorCreate').value;
    const cardContent = document.getElementById('cardContentCreate').value;
    const cardFile = document.getElementById('cardfileCreate').value;
    const card = {
      name: cardTitle,
      color: cardColor,
      content: cardContent,
      fileUrl: cardFile,
      members: selectedMemberNumber,
      sequence: cardSequence,
    };
    console.log('create 보내기 전 :', cardColumnId, cardSequence);
    CardCreate(cardColumnId, card);
  });
}

// column name update api
async function BoardColumnNameUpdate(columnId, name) {
  $.ajax({
    type: 'PUT',
    url: `/board-columns/${columnId}?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    data: JSON.stringify({ name }),
    success: (data) => {
      console.log(data.message);
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card get api
async function CardGet(columnId) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  // console.log(columnId);
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
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  console.log(columnId, data);
  await $.ajax({
    type: 'POST',
    url: `/cards?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({
      name: data.name,
      content: data.content,
      file_url: data.fileUrl,
      sequence: data.sequence,
      members: data.members,
      color: data.color,
    }),
    success: function (data) {
      console.log(data.message);
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// 코멘트 생성 함수
function createComment(columnId, cardId) {
  const commentInput = document.getElementById('commentInput').value;

  // 코멘트 입력란이 비어있지 않은 경우에만 처리
  if (commentInput.trim() !== '') {
    const comment = {
      comment: commentInput,
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
        console.log(data.message);
        // 코멘트 생성 후 코멘트 목록을 다시 불러와 화면에 표시
        DetailCardGet(columnId, cardId);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
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
      console.log(commentDetail);
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
  $('#commentDetailModalLabel').text('Comment');
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
  const commentList = $('#commentDetailModal .kanban-modal__list ul');
  commentList.empty(); // 목록 초기화

  // commentsData를 사용하여 코멘트 목록을 처리
  for (const comment of filteredComments) {
    // 필요한 데이터를 추출하여 모달에 추가
    const isCurrentUserComment = comment.user.id === comment.userId;
    console.log(filteredComments); // 현재 사용자의 댓글 여부 확인

    const commentHTML = `
      <div class="checkbox-group d-flex">
        <div class="checkbox-group__single d-flex row">
          <label class="strikethrough" style="color: black;">
            ${comment.user.name}
          </label>
          <textarea class="form-control" rows="3" readonly="" id="replyUpdate">${comment.comment}</textarea>
          
          <!-- 수정 버튼 -->
          ${isCurrentUserComment
        ? `<button class="btn btn-sm btn-primary edit-comment" data-card-id="${comment.card.id}" data-comment-id="${comment.id}">수정</button>`
        : ''
      }
          
          <!-- 삭제 버튼 -->
          ${isCurrentUserComment
        ? `<button class="btn btn-sm btn-danger delete-comment" data-card-id="${comment.card.id}" data-comment-id="${comment.id}">삭제</button>`
        : ''
      }
      <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary" id="replyConfirmBtn" style="display: none;">확인</button>
        </div>
      </div>
    `;

    // 코멘트 목록에 추가
    commentList.append(commentHTML);
  }

  // 모달을 표시
  $('#commentDetailModal').modal('show');

  $('.edit-comment').click(function () {
    // textarea를 편집 가능하게 변경
    const replyTextarea = $('#replyUpdate'); // 수정된 부분
    replyTextarea.removeAttr('readonly');
    // 확인 버튼을 보이게 함
    document.getElementById('replyConfirmBtn').style.display = 'inline-block';
  });

  $('.delete-comment').click(function () {
    const cardId = $(this).data('card-id');
    const commentId = $(this).data('comment-id');

    deleteComment(commentId, cardId);
  });

  // 확인 버튼 클릭 이벤트 처리
  document.getElementById('replyConfirmBtn').addEventListener('click', function () {
    const commentId = $(this).prevAll('.edit-comment').data('comment-id');
    const cardId = $(this).prevAll('.edit-comment').data('card-id');
    const columnId = document.getElementById('commentUpdateBtn').getAttribute('data-column-id');
    // textarea를 읽기 전용으로 변경
    const replyTextarea = $('#replyUpdate'); // 수정된 부분
    const updatedReply = replyTextarea.val(); // 수정된 부분
    replyTextarea.attr('readonly', 'readonly'); // 수정된 부분
    // 확인 버튼을 숨김
    $('.replyConfirmBtn').hide();

    CommentUpdate(commentId, columnId, cardId, { comment: updatedReply });
  });
}

document.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'commentDetail') {
    const commentId = event.target.getAttribute('data-commentId');
    const cardId = event.target.getAttribute('data-cardId');
    const columnId = document.getElementById('updateCardButton').getAttribute('data-column-id');
    Getcomment(cardId, commentId);
    openCommentDetailModal(columnId, cardId, commentId);
    $('#commentDetailModal').modal('show');
    console.log('컬럼아이디', columnId);
  }
});

// 카드 세부 정보 모달을 생성하는 함수
function createCardDetailModal(cardData, commentsData, columnId, cardId, users) {
  // 모달 바디의 HTML을 생성

  // 멤버 리스트의 HTML을 생성
  let membersHTML = '';
  selectedMembers = [];
  selectedMemberNumber = [];
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
    console.log('click함', selectedMembers);
    selectedMemberNumber.push(member[0].userId);
  }

  let commentHTML = '';
  for (const comment of commentsData) {
    // reply_id가 없는 코멘트만 처리
    if (!comment.reply_id) {
      const cardId = cardData.id;
      const commentId = comment.id;
      console.log(comment.user.name);

      commentHTML += `
        <div class="checkbox-group d-flex" id="commentDetail"
          data-cardId="${cardId}" data-commentId="${commentId}">
          <div class="checkbox-group__single d-flex row">
            <label class="strikethrough" style="color: black;">
              ${comment.user.name}
            </label>
            <p> ${comment.comment} </p>
          </div>
        </div> `;
    }
  }

  const modalContentHTML = `
  <div class=" kanban-modal__header-wrapper">
  <div class="kanban-modal__header">
     <h5 class="modal-title" id="exampleModalLabel">${cardData.name}</h5>
     <span>in list Active Project</span>
  </div>
   <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary"
id="updateCardButton" data-column-id="${columnId}" data-card-id="${cardData.id}">update</button>
<button class="btn btn-primary btn-sm btn-squared btn-transparent-primary"
id="cardDeleteBtn" data-column-id="${columnId}" data-card-id="${cardData.id}" onclick="deleteCard(this)">delete</button>
<button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
<img src="./assets/img/svg/x.svg" alt="x" class="svg">
</button>
</div>
<div class="modal-body kanban-modal__body">
  <div class="kanban-modal__form ">
     <div class="mb-30">
        <label for="exampleFormControlTextarea1111" class="form-label">Description</label>
        <textarea class="form-control" readonly rows="3" id="cardDetailDescription">${cardData.content}</textarea>
     </div>
     <div class="row">
        <label> image file</label>
        <div id="cardDetailImgFile">
           ${cardData.file_url}
        </div>
        <label style="margin-top: 3%;">Files other than image files</label>
        <div id="cardDetailNotImgFile">
           <!-- 파일이 이미지가 아닐 경우 -->
           <a href="./assets/img/american-express.png" download=""> 파일명 </a>
           <a href="./assets/img/american-express.png" download=""> 파일명 </a>
        </div>
     </div>
     <!-- <button class="btn btn-primary btn-sm btn-squared  rounded"><img src="./assets/img/svg/check-square.svg" alt="check-square" class="svg"> Add Checklist</button> -->
  </div>

    <div class="kanban-modal__research mt-30">
      <h6>Members</h6>
    </div>
    <div class="kanban-modal__list">
      <ul id="cardDetailMembers">
        ${membersHTML}
      </ul>
    </div>
    <div class="kanban-modal__list">
      <h6>Comment</h6>
      <div class="comment-input">
        <textarea class="form-control" rows="3" placeholder="Add a comment..." id="commentInput"></textarea>
        <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary" id="addCommentButton">Comment +</button>
      </div>
      <ul id="commentDetail">
        <!-- 코멘트 목록이 여기에 추가될 것입니다. -->
        ${commentHTML}
      </ul>
    </div>
    `;

  // 새로운 모달을 생성
  const modal = document.createElement('div');
  modal.className = 'modal fade kanban-modal__card kanban__modal';
  modal.id = 'exampleModal';
  modal.tabIndex = '-1';
  modal.setAttribute('aria-labelledby', 'exampleModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        ${modalContentHTML}
      </div>
    </div>
    `;

  // 모달을 body에 추가
  document.body.appendChild(modal);

  // 모달을 화면에 표시
  $(modal).modal('show');
}

// 카드 세부 정보 모달을 열기 위한 함수
function openCardDetailModal(columnId, cardId) {
  // 카드 세부 정보를 서버에서 가져오는 API 호출
  DetailCardGet(columnId, cardId);
  CardGet(columnId, cardId);
}

// 멤버 찾기 workspace에서 붙여옴
let typingTimer;
let selectedMembers = [];
let selectedMemberNumber = [];

$(document).ready(() => {
  initializeMemberInput('#cardCreateAddMemberBtn', '#cardCreateMemberView', '#selected-members');
  initializeMemberInput('#cardUpdateAddMembers', '#cardUpdateMembers', '#update-selected-members');
});

function initializeMemberInput(inputSelector, memberListSelector, selected) {
  const memberInput = document.querySelector(inputSelector);
  const selectedMemberList = document.querySelector(memberListSelector);

  memberInput.addEventListener('click', async (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
      const results = await searchMembers();
      console.log(results);

      document.getElementById(e.target.id).addEventListener('click', () => {
        console.log('id 확인 : ', e.target.id);
      });

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
            console.log('click함', selectedMembers);
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
  try {
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
      });
      users.push(boardMembers);
      console.log(boardMembers);
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
    console.log(commentsResponse);
    createCardDetailModal(cardData, commentsData, columnId, cardId, users);
    openUpdateCardModal(cardData, columnId, cardId);
  } catch (error) {
    console.log(error);
  }
}

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
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// 업데이트 모달을 열기 위한 함수
function openUpdateCardModal(cardData, columnId, cardId) {
  // 모달 내부의 필드들을 초기화 (빈 값으로)
  document.getElementById('cardTitleUdpate').value = cardData.name;
  document.getElementById('cardContentUpdate').value = cardData.content;
  document.getElementById('cardfileUpdate').value = '';
  document.getElementById('cardUpdateMembers').innerHTML = cardData.members;
  document.getElementById('cardColorUpdate').value = cardData.color;
  // 컬럼 아이디와 카드 아이디를 모달의 data 속성에 설정
  document.getElementById('updateCardButton').setAttribute('data-column-id', columnId);
  document.getElementById('updateCardButton').setAttribute('data-card-id', cardId);
  // 업데이트 모달을 열기
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
  const updatedCardName = document.getElementById('cardTitleUdpate').value;
  const updatedCardContent = document.getElementById('cardContentUpdate').value;
  // 파일 업로드를 위한 코드 추가
  const updatedCardFileInput = document.getElementById('cardfileUpdate');
  const updatedCardFile = updatedCardFileInput.files[0];

  // 멤버는 이미 선택된 것을 사용하므로 selectedMemberNumber를 그대로 사용
  const updatedCardMembers = selectedMemberNumber;
  const updatedCardColor = document.getElementById('cardColorUpdate').value;

  // 업데이트할 데이터를 객체로 만들어서 전송
  const updatedData = {
    name: updatedCardName,
    content: updatedCardContent,
    fileUrl: updatedCardFile ? URL.createObjectURL(updatedCardFile) : null, // 파일이 있는 경우에만 처리
    members: updatedCardMembers,
    color: updatedCardColor,
  };

  // 업데이트 함수 호출
  CardAllUpdate(columnId, cardId, updatedData);
  window.location.reload();
});

// card update api
async function CardAllUpdate(columnId, cardId, data) {
  try {
    // PATCH 요청을 보내기 전에 데이터 확인
    console.log('Updated Data:', data);

    const response = await $.ajax({
      type: 'PATCH',
      url: `/cards/${cardId}?board_column_Id=${columnId}`,
      data: JSON.stringify({
        name: data.name,
        content: data.content,
        file_url: data.fileUrl,
        members: data.members,
        color: data.color,
      }),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    // 업데이트 응답 결과 확인
    console.log('Update Response:', response.message);

    // 성공적으로 업데이트가 완료되었을 때 모달을 닫을 수 있습니다.
    $('#updateCardModal').modal('hide');
  } catch (error) {
    console.log(error);
  }
}

// 함수 내에서 카드 삭제를 처리하는 로직
function deleteCard(button) {
  const columnId = button.getAttribute('data-column-id');
  const cardId = button.getAttribute('data-card-id');
  console.log('deleteCard : ', columnId, cardId);
  // 카드 삭제 API 호출
  $.ajax({
    type: 'DELETE',
    url: `/cards/${cardId}?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log(data.message);

      // 삭제 성공 후, 페이지 새로고침
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// 버튼 클릭 이벤트 핸들러
function handleDeleteButtonClick(button) {
  const columnId = button.getAttribute('data-column-id');
  const cardId = button.getAttribute('data-card-id');

  // 카드 삭제 함수 호출
  deleteCard(columnId, cardId);
}

// 버튼 클릭 이벤트 리스너 등록
const deleteButtons = document.querySelectorAll('.btn-delete-card');
deleteButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleDeleteButtonClick(button);
  });
});

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
      console.log(data.message);

      // 삭제 성공 후, 페이지 새로고침
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
    deleteComment(commentId, cardId);
    console.log('삭제', commentId, cardId);
  }
});

// comment update api
async function CommentUpdate(commentId, columnId, cardId, data) {
  try {
    // PATCH 요청을 보내기 전에 데이터 확인
    console.log('코멘트 수정:', data);

    const response = await $.ajax({
      type: 'PATCH',
      url: `/comments/${commentId}?board_column_id=${columnId}&cardId=${cardId}`,
      data: JSON.stringify({
        comment: data.comment,
      }),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    // 업데이트 응답 결과 확인
    console.log('Update Response:', response.message);
  } catch (error) {
    console.log(error);
  }
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
      console.log(data.message);
      // 코멘트 생성 후 코멘트 목록을 다시 불러와 화면에 표시
    },
    error: (error) => {
      console.log(error);
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

  // 입력란 비우고 숨김
  document.getElementById('replayComment').value = '';
  const commentAddBox = document.getElementById('commentAddBox');
  commentAddBox.style.display = 'none';
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
      } else {
        console.log('No comments found with the desired reply_id.');
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
}
