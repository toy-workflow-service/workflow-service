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
    const a = $(this).draggable({
      zIndex: 999,
      revert: true, // will cause the event to go back to its
      revertDuration: 0, //  original position after the drag
    });
    console.log(a);
  });

  let date = new Date();

  // 이 밑으론 값을 넣으면 해당 변수들을 소스배열에 넣어 해당 캘린더에 뿌려주나보다.
  // let familyEvents = {
  //   id: 1,
  //   events: [
  //     {
  //       id: '1',
  //       start: moment().format('YYYY-MM-DD') + 'T08:30:00',
  //       title: 'Family Events',
  //     },
  //     {
  //       id: '2',
  //       start: moment().format('YYYY-MM-DD') + 'T10:30:00',
  //       end: moment().format('YYYY-MM-DD') + 'T12:00:00',
  //       title: 'Dinner with Family',
  //     },
  //   ],
  //   className: 'primary',
  //   textColor: '#5F63F2',
  // };
  document.addEventListener('DOMContentLoaded', async function () {
    let results = await GetCalendarApi();
    let resultArr = [];
    for (let i = 0; i < results.length; i++) {
      let cName;
      let cColor;
      if (results[i].type == 1) {
        cName = `secondary calendarId${results[i].calendarId}`;
        cColor = '#FF69A5';
      } else if (results[i].type == 2) {
        cName = `primary calendarId${results[i].calendarId}`;
        cColor = '#5F63F2';
      } else if (results[i].type == 3) {
        cName = `success calendarId${results[i].calendarId}`;
        cColor = '#20C997';
      } else {
        cName = `success calendarId${results[i].calendarId}`;
        cColor = '#20C997';
      }
      const offset = new Date().getTimezoneOffset() * 60 * 1000;
      let startDate = new Date(new Date(results[i].startDate).getTime() - offset).toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      console.log(results[i].startDate);
      console.log(startDate);
      // document.querySelector('.fc-event').attr('id', `calendarCardId${results[i].calendarId}`);
      let product = {
        id: i + 1,
        events: [
          {
            id: results[i].calendarId,
            start: moment(results[i].startDate).format('YYYY-MM-DD HH:mm:ss'),
            end: moment(results[i].deadline).format('YYYY-MM-DD HH:mm:ss'),
            title: results[i].title,
          },
        ],
        className: cName,
        textColor: cColor,
      };

      resultArr.push(product);
    }

    var fullCalendar = document.getElementById('full-calendar');
    if (fullCalendar) {
      var calendar = new FullCalendar.Calendar(fullCalendar, {
        headerToolbar: {
          left: 'today,prev,title,next',
          right: 'timeGridDay,dayGridMonth',
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
        initialView: 'timeGridDay',
        eventStartEditable: false,
        drop: function (arg) {
          console.log('??');
          // if (document.getElementById('drop-remove').checked) {
          //   // if so, remove the element from the "Draggable Events" list
          //   arg.draggedEl.parentNode.removeChild(arg.draggedEl);
          // }
        },
        //요소가 DOM에 추가된 직후 호출
        eventDidMount: function (view) {
          $('.fc-list-day').each(function () {});
        },
        //사용자가 이벤트를 클릭하면 트리거 - 상세 모달이 보여짐
        eventClick: async function (infoEvent) {
          let lastName = infoEvent.el.classList[9];
          if (!lastName) {
            lastName = infoEvent.el.classList[8];
          }
          const calendarId = lastName.replace('calendarId', '');
          // 이부분에 상세조회api
          const detailGet = await DetailGetCalendarApi(calendarId);
          console.log(detailGet);
          let infoModal = $('#e-info-modal');
          infoModal.modal('show');
          console.log(infoModal.find('.e-info-title'));
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
          startDate = startDate.split(' ');
          let startTime = startDate[3] + startDate[4];
          startDate = startDate[0] + startDate[1] + startDate[2];
          deadline = deadline.split(' ');
          let deadTime = deadline[3] + deadline[4];
          deadline = deadline[0] + deadline[1] + deadline[2];
          document.querySelector('#view-date').innerHTML = `${
            '20' + startDate.substring(0, 10).replace('-', '.').replace('-', '.')
          } - ${'20' + deadline.substring(0, 10).replace('-', '.').replace('-', '.')}`;
          document.querySelector('#view-time').innerHTML = `${startTime} - ${deadTime}`;
          document.querySelector('#view-description').innerHTML = `${detailGet.description}`;
          // 상세조회에서 받아온 값으로 넣은뒤 addEventListener로 수정값넣기 / 여기서 삭제api도 연결..?
        },
      });

      //이부분은 옆 애들 끌어다가 놓던데.. 저장을 하려면.. 음.. 없앨까 카드만 옮기는건 따로 위에 있으니
      let eventElement = document.getElementById('draggable-events');
      let draggable = new FullCalendar.Draggable(eventElement, {
        itemSelector: '.draggable-event-list__single',
        eventData: function (eEl) {
          console.log(eEl);

          return {
            title: eEl.innerText,
            className: $(eEl).data('class'),
          };
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
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
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
  let type = document.querySelector('#type');
  // console.dir(type);
  for (let i = 0; i < 3; i++) {
    if (type.children[i].children[0].checked) {
      type = Number(type.children[i].children[0].value);
      break;
    }
  }
  // console.log(new Date(startDate + 'T' + startTime));
  // console.log(moment(new Date(deadline + 'T' + deadTime)).format('HH:mm:ss'));
  const data = {
    title,
    description,
    deadline: new Date(deadline + 'T' + deadTime),
    startDate: new Date(startDate + 'T' + startTime),
    type,
  };
  console.log(data);
  CreateCalendarApi(data);
});

// 조회 api
async function GetCalendarApi() {
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
      console.log(error);
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
      console.log(error);
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
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

//수정 api
async function UpdateCalendarApi(calendarId, data) {
  await $.ajax({
    type: 'POST',
    url: `/calendars/${calendarId}`,
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
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}
