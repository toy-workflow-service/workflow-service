(function ($) {
  // initialize the external events
  $('#external-events .fc-event').each(function (event) {
    // store data so the calendar knows to render an event upon drop
    $(this).data('event', {
      title: $.trim($(this).text()), // use the element's text as the event title
      stick: true, // maintain when user navigates (see docs on the renderEvent method)
    });
    // make the event draggable using jQuery UI
    // event.preventDefault();
    $(this).draggable({
      zIndex: 999,
      revert: true, // will cause the event to go back to its
      revertDuration: 0, //  original position after the drag
    });
  });

  $('.ui-datepicker-calendar').css({ 'pointer-events': 'none' });
  $('.ui-datepicker-prev').css({ display: 'none' });
  $('.ui-datepicker-next').css({ display: 'none' });

  document.addEventListener('DOMContentLoaded', async function () {
    let accessToken;
    const regExp = new RegExp(/^[accessToken=]/);
    document.cookie.split(' ').forEach((value) => {
      if (regExp.exec(value)) {
        accessToken = value;
        accessToken = accessToken.replace('accessToken=', '');
        accessToken = accessToken.replace(';', '');
      }
    });
    let results = await GetCalendarApi(accessToken);
    let resultArr = [];
    for (let i = 0; i < results.length; i++) {
      let cName;
      let cColor;
      // id값을 설정해도 가져올수 없어 class name 제일 마지막에 아이디값을 넣어줌
      if (results[i].type == 1) {
        cName = `primary calendarId${results[i].calendarId}`;
        cColor = '#5F63F2';
      } else if (results[i].type == 2) {
        cName = `warning calendarId${results[i].calendarId}`;
        cColor = '#FA8B0C';
      } else if (results[i].type == 3) {
        cName = `success calendarId${results[i].calendarId}`;
        cColor = '#20C997';
      }

      const offset = new Date().getTimezoneOffset() * 60 * 1000;
      let startSendDate = new Date(new Date(results[i].startDate).getTime() - offset).toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      let lastSendDate = new Date(new Date(results[i].deadline).getTime() - offset).toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      let lastTime = lastSendDate.substring(12).split(' ');

      lastSendDate = ('20' + lastSendDate.substring(0, 10).replace('.', '-').replace('.', '-')).replaceAll(' ', '');
      let lastArrTime = lastTime[1].split(':');
      if (lastTime[0] == '오후' && Number(lastArrTime[0]) < 12) {
        let sum = Number(lastArrTime[0]);
        lastTime[1] = `${sum}:${lastArrTime[1]}:${lastArrTime[2]}`;
      } else if (lastTime[0] == '오전' && Number(lastArrTime[0]) == 12) {
        lastTime[1] = `00:${lastArrTime[1]}:${lastArrTime[2]}`;
      }
      lastTime = 'T' + lastTime[1];

      let startTime = startSendDate.substring(12).split(' ');

      startSendDate = ('20' + startSendDate.substring(0, 10).replace('.', '-').replace('.', '-')).replaceAll(' ', '');

      let arrTime = startTime[1].split(':');
      if (startTime[0] == '오후' && Number(arrTime[0]) < 12) {
        let sum = Number(arrTime[0]);
        startTime[1] = `${sum}:${arrTime[1]}:${arrTime[2]}`;
      } else if (startTime[0] == '오전' && Number(arrTime[0]) == 12) {
        startTime[1] = `00:${arrTime[1]}:${arrTime[2]}`;
      }
      startTime = 'T' + startTime[1];

      if (startSendDate == lastSendDate) {
        let product = {
          id: i + 1,
          events: [
            {
              id: results[i].calendarId,
              start: startSendDate + startTime,
              end: lastSendDate + lastTime,
              title: results[i].title,
            },
          ],
          className: cName,
          textColor: cColor,
        };
        resultArr.push(product);
      } else {
        let familyEvents = {
          id: i + 1,
          events: [
            {
              id: results[i].calendarId,
              start: startSendDate + startTime,
              title: '[start]' + results[i].title,
            },
            {
              id: results[i].calendarId,
              start: lastSendDate + lastTime,
              title: '[end]' + results[i].title,
            },
          ],
          className: cName,
          textColor: cColor,
        };
        resultArr.push(familyEvents);
      }
    }

    var fullCalendar = document.getElementById('full-calendar');
    if (fullCalendar) {
      var calendar = new FullCalendar.Calendar(fullCalendar, {
        headerToolbar: {
          left: 'today,prev,title,next',
          right: 'dayGridMonth',
        },
        views: {
          listMonth: {
            buttonText: 'Schedule',
            titleFormat: { month: 'short', weekday: 'short' },
          },
        },
        //달력 상단에 "종일" 시간대를 표시할지 여부를 결정
        allDaySlot: false,
        //캘린더의 이벤트를 수정할 수 있는지 여부를 결정
        editable: true,
        //원하는 만큼의 이벤트 배열 , 함수 , JSON 피드 URL 또는 전체 이벤트 소스 개체를 배열 에 넣을 수 있음 - 값을 뿌려줌
        eventSources: [...resultArr],
        //달력의 보기 영역 높이를 설정
        contentHeight: 800,
        //캘린더가 로드될 때의 초기 보기 - 'dayGridWeek', 'timeGridDay','listWeek'등이 있음
        initialView: 'dayGridMonth',
        // draggable false -> 드래그 없앤 이유: drop이나 stop 이후 수정이 되야하는데 해당 이벤트를 받을 수 없음. 위에서도 마찬가지.
        eventStartEditable: false,
        //한국어 설정
        locale: 'ko',
        //요소가 DOM에 추가된 직후 호출
        eventDidMount: function (view) {
          $('.fc-list-day').each(function () {});
        },
        //사용자가 이벤트를 클릭하면 트리거 - 상세 모달이 보여짐
        eventClick: async function (infoEvent) {
          //하루 일정으로 볼 경우
          let lastName = infoEvent.el.classList[9];
          if (!lastName || lastName.search('calendarId') < 0) {
            //이부분은 한달 일정으로 볼 경우.
            lastName = infoEvent.el.classList[8];
          }
          if (!lastName || lastName.search('calendarId') < 0) {
            //이부분은 한달 일정으로 볼 경우.
            lastName = infoEvent.el.classList[7];
          }
          const calendarId = lastName.replace('calendarId', '');
          // 이부분에 상세조회api
          const detailGet = await DetailGetCalendarApi(calendarId);

          let infoModal = $('#e-info-modal');
          infoModal.modal('show');

          infoModal.find('.e-info-title').text(infoEvent.event.title);
          const offset = new Date().getTimezoneOffset() * 60 * 1000;
          let startDate = new Date(new Date(detailGet.startDate).getTime() - offset).toLocaleString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          let deadline = new Date(new Date(detailGet.deadline).getTime() - offset).toLocaleString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          let deadlineTime = deadline.substring(12).split(' ');

          deadline = ('20' + deadline.substring(0, 10).replace('.', '-').replace('.', '-')).replaceAll(' ', '');
          let lastArrTime = deadlineTime[1].split(':');
          if (deadlineTime[0] == '오후' && Number(lastArrTime[0]) < 12) {
            let sum = Number(lastArrTime[0]);
            deadlineTime[1] = `${sum}:${lastArrTime[1]}`;
          } else if (deadlineTime[0] == '오전' && Number(lastArrTime[0]) == 12) {
            deadlineTime[1] = `00:${lastArrTime[1]}`;
          }
          deadlineTime = deadlineTime[1];

          let startTime = startDate.substring(12).split(' ');

          startDate = ('20' + startDate.substring(0, 10).replace('.', '-').replace('.', '-')).replaceAll(' ', '');

          let arrTime = startTime[1].split(':');
          if (startTime[0] == '오후' && Number(arrTime[0]) < 12) {
            let sum = Number(arrTime[0]);
            startTime[1] = `${sum}:${arrTime[1]}`;
          } else if (startTime[0] == '오전' && Number(arrTime[0]) == 12) {
            startTime[1] = `00:${arrTime[1]}`;
          }
          startTime = startTime[1];
          document.querySelector('#view-date').innerHTML = `${startDate} - ${deadline}`;
          document.querySelector('#view-time').innerHTML = `${startTime} - ${deadlineTime}`;
          document.querySelector('#view-description').innerHTML = `${detailGet.description}`;

          // 상세보기 모달에서 삭제 버튼 클릭시
          document.querySelector('#delete-event').addEventListener('click', () => {
            deleteConfirmModal(calendarId, 'calendar');
          });
        },
      });

      calendar.render();
      $('.fc-button-group .fc-listMonth-button').prepend('<i class="las la-list"></i>');
    }
  });
})(jQuery);

// 생성 api
async function CreateCalendarApi(data) {
  await $.ajax({
    type: 'POST',
    url: '/calendars',
    data: JSON.stringify({
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      start_date: data.startDate,
      type: data.type,
    }),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
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
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
    },
  });
}

// 생성 모달 값
document.querySelector('#save-button').addEventListener('click', () => {
  const title = document.querySelector('input[name="e-title"]').value;
  const description = document.querySelector('textarea[name="e-description"]').value;
  const startDate = document.querySelector('#start-date').value;
  const deadline = document.querySelector('#deadline').value;
  const startTime = document.querySelector('#start-time').value;
  const deadTime = document.querySelector('#dead-time').value;

  const type = $('input[type=radio][name=radio-e-type]:checked').val();

  if (!type) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '이벤트 타입을 선택해 주세요. ',
    });
    return;
  }

  let passDate = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  let passTime = /^(0[0-9]|1[0-9]|2[0-3]):(0[1-9]|[0-5][0-9])$/;
  let compareDate = [startDate.replaceAll('-', ''), deadline.replaceAll('-', '')];
  let compareTime = [startTime.replaceAll(':', ''), deadTime.replaceAll(':', '')];

  if (!passDate.test(startDate) || !passDate.test(deadline)) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '날짜 형식이 일치하지 않습니다.',
    });
  } else if (!passTime.test(startTime) || !passTime.test(deadTime)) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '시간 형식이 일치하지 않습니다.',
    });
  } else if (Number(compareDate[0]) == Number(compareDate[1]) && Number(compareTime[0]) > Number(compareTime[1])) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '종료시간은 시작시간보다 앞에 올 수 없습니다.',
    });
  } else if (Number(compareDate[0]) > Number(compareDate[1])) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '종료날짜는 시작날짜보다 앞에 올 수 없습니다.',
    });
  } else {
    const data = {
      title,
      description,
      deadline: new Date(deadline + 'T' + deadTime),
      startDate: new Date(startDate + 'T' + startTime),
      type,
    };

    CreateCalendarApi(data);
  }
});

// 조회 api
async function GetCalendarApi(accessToken) {
  const results = await $.ajax({
    type: 'GET',
    url: '/calendars',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: (data) => {
      return data;
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

  return results;
}

// 상세 조회 api
async function DetailGetCalendarApi(calendarId) {
  const result = await $.ajax({
    type: 'GET',
    url: `/calendars/${calendarId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: (data) => {
      return data;
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
    },
  });

  return result;
}

// 삭제 api
async function DeleteCalendarApi(calendarId) {
  await $.ajax({
    type: 'DELETE',
    url: `/calendars/${calendarId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken} `);
    },
    success: (data) => {
      location.reload();
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
    },
  });
}

// 삭제 확인 모달 출력
function deleteConfirmModal(calendarId, targetType) {
  const confirmModal = document.querySelector('#modal-info-confirmed');
  $(confirmModal).modal('show');

  const okBtn = confirmModal.querySelector('.btn-info');
  const cancelBtn = confirmModal.querySelector('.btn-light');

  okBtn.addEventListener('click', () => {
    if (targetType === 'calendar') {
      DeleteCalendarApi(calendarId);
    }
    $(confirmModal).modal('hide');
  });

  cancelBtn.addEventListener('click', () => {
    $(confirmModal).modal('hide');
  });
}
