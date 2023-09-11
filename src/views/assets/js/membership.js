const sixmonthPayBtn = document.querySelector('#sixmonth-btn');
const onemonthPayBtn = document.querySelector('#onemonth-btn');

onemonthPayBtn.addEventListener('click', async () => {
  let paymentModal = document.querySelector('#modal-basic');

  await $.ajax({
    method: 'GET',
    url: '/workspaces',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      paymentModal.innerHTML = `
        <div class="modal-dialog modal-md" role="document">
          <div class="modal-content modal-bg-white">
            <div class="modal-header">
              <h6 class="modal-title">멤버십 결제</h6>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <img src="./assets/img/svg/x.svg" alt="x" class="svg" />
              </button>
            </div>
            <div class="modal-body">
              <p><strong>멤버십 타입:</strong> <span id="membership-type">Premium</span></p>
              <p><strong>결제금액:</strong> <span id="membership-price">6,500</span><span>원</span></p>
              <p><strong>이용기간:</strong> <span id="service-period">30</span><span>일</span></p>
              <div class="dropdown dropdown-hover">
                <a style="cursor:pointer;">
                <span id="workspace-select-text">워크스페이스 선택</span>
                  <img src="./assets/img/svg/chevron-down.svg" alt="chevron-down" class="svg" />
                </a>
                <div class="dropdown-default dropdown-clickEvent">
                ${data
                  .map(
                    (workspace) => `
                <a class="dropdown-item" data-workspace-id="${workspace.id}" style="cursor:pointer;">${workspace.name}</a>
              `
                  )
                  .join('')}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary btn-sm" id="payment-btn">결제</button>
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">취소</button>
            </div>
          </div>
        </div>`;
      let worspaceItems = document.querySelectorAll('.dropdown-default .dropdown-item');
      worspaceItems.forEach((item) => {
        item.addEventListener('click', () => {
          let selected = item.textContent;
          let selectedId = item.getAttribute('data-workspace-id');
          document.querySelector('#workspace-select-text').textContent = selected;
          document.querySelector('#workspace-select-text').setAttribute('data-workspace-id', selectedId);
        });
      });

      const paymentBtn = document.querySelector('#payment-btn');
      paymentBtn.addEventListener('click', () => {
        purchaseMembership();
      });
    },
  });
  $(paymentModal).modal('show');
});

sixmonthPayBtn.addEventListener('click', async () => {
  let paymentModal = document.querySelector('#modal-basic');

  await $.ajax({
    method: 'GET',
    url: '/workspaces',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      paymentModal.innerHTML = `
      <form>
        <div class="modal-dialog modal-md" role="document">
          <div class="modal-content modal-bg-white">
            <div class="modal-header">
              <h6 class="modal-title">멤버십 결제</h6>
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <img src="./assets/img/svg/x.svg" alt="x" class="svg" />
              </button>
            </div>
            <div class="modal-body">
              <p><strong>멤버십 타입:</strong> <span id="membership-type">Premium</span></p>
              <p><strong>결제금액:</strong> <span id="membership-price">31,000</span><span>원</span></p>
              <p><strong>이용기간:</strong> <span id="service-period">180</span><span>일</span></p>
              <div class="dropdown dropdown-hover">
                <a style="cursor:pointer;">
                <span id="workspace-select-text">워크스페이스 선택</span>
                  <img src="./assets/img/svg/chevron-down.svg" alt="chevron-down" class="svg" />
                </a>
                <div class="dropdown-default dropdown-clickEvent">
                ${data
                  .map(
                    (workspace) => `
                <a class="dropdown-item" data-workspace-id="${workspace.id}" style="cursor:pointer;">${workspace.name}</a>
              `
                  )
                  .join('')}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary btn-sm" id="payment-btn">결제</button>
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">취소</button>
            </div>
          </div>
        </div>
        </form>`;

      let worspaceItems = document.querySelectorAll('.dropdown-default .dropdown-item');
      worspaceItems.forEach((item) => {
        item.addEventListener('click', () => {
          let selected = item.textContent;
          let selectedId = item.getAttribute('data-workspace-id');
          document.querySelector('#workspace-select-text').textContent = selected;
          document.querySelector('#workspace-select-text').setAttribute('data-workspace-id', selectedId);
        });
      });

      const paymentBtn = document.querySelector('#payment-btn');
      paymentBtn.addEventListener('click', () => {
        purchaseMembership();
      });
    },
  });
  $(paymentModal).modal('show');
});

async function purchaseMembership() {
  try {
    let membershipType = document.querySelector('#membership-type').textContent;
    if (membershipType === 'Premium') membershipType = 1;
    const membershipPrice = document.querySelector('#membership-price').textContent.replace(',', '') / 1;
    const servicePeriod = document.querySelector('#service-period').textContent / 1;
    const workspaceId = document.querySelector('#workspace-select-text').getAttribute('data-workspace-id');

    if (workspaceId === null) {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'error',
        text: '워크스페이스를 선택해주세요.',
      }).then(() => {
        return;
      });
    } else {
      await $.ajax({
        method: 'POST',
        url: `/workspaces/${workspaceId}/payments`,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
        },
        data: JSON.stringify({ packageType: membershipType, packagePrice: membershipPrice, servicePeriod }),
        success: () => {
          Swal.fire({
            customClass: {
              container: 'my-swal',
            },
            icon: 'success',
            title: 'success!',
            text: '멤버십 결제 완료!',
          }).then(() => {
            window.location.reload();
          });
        },
        error: (err) => {
          if (err.status === 308) {
            Swal.fire({
              customClass: {
                container: 'my-swal',
              },
              icon: 'error',
              title: 'error',
              text: err.responseJSON.message,
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
              text: err.responseJSON.message,
            }).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
  } catch (err) {
    console.error(err);
  }
}
