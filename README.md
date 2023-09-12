## 프로젝트 소개

### Work - Flow

![제목을 입력하세요](./src/views/assets/img/main.png)

Work Flow는 사람들과의 협업을 위한 서비스 입니다.
자신의 작업 공간에 팀원들 초대해서 함께 작업하고 서로 의견을 나눠보세요.

## 서비스 아키텍처

![Untitled (1)](https://github.com/toy-workflow-service/workflow-service/assets/133616786/f3fd887a-a5dd-4fa3-940f-cc8e6d2e305d)

## 기술적 의사결정

| 사용기술  | 기술 설명                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------- |
| NestJS    | 안정성과 코드 가독성이 뛰어난 TypeScript를 지원하며 코드의 관리 및 유지 보수가 용이하여 사용            |
| TypeORM   | 객체지향적인 방식으로 데이터 베이스를 다룰 수 있으며 유지 보수 및 리팩토링에 용이하여 사용              |
| Socket.io | 실시간 양방향 통신을 사용하여 실시간 채팅 및 알림 메시지등을 전송하기 위하여 사용                       |
| JWT       | 사용자가 로그인 하였을 때, Access Token과 Refresh Token을 발급하고 사용자가 권한을 허가받기 위하여 사용 |
| Redis     | JWT에서 발급 받은 Access Token과 Refresh Token을 저장하고 관리하기 위하여 사용                          |
| Multer    | 파일 업로드 및 다운로드를 처리하여 사용자가 파일을 업로드, 다운로드 할 수 있게 하기 위하여 사용         |
| Web RTC   | 웹기반 영상 통화 및 화면 공유 등의 실시간 통신을 구현하기 위하여 사용                                   |

## 주요 기능

1. 워크 스페이스 : 보드 생성 및 팀원 초대
2. 채팅 및 영상 통화 : 실시간 메세지 전송 및 영상 통화
3. 멤버쉽
4. 로그인 : 로그인 회원가입 및 소셜 로그인

## 트러블 슈팅

<details><summary>Error EPERM: operation not permitted
</summary>

껏다키고 노트북도 재시작을 해도 마찬가지로 오류가 나왔음.

**해결방법**

1. vscode 를 닫는다.
2. 해당 폴더로 이동한뒤 powershell 을 연다
3. npm 캐시를 제거한다

```jsx
# npm cache clean --force
```

4. npm 을 최신버전으로 업데이트한다

```jsx
# npm install -g npm@latest --force
```

5. npm 캐시를 다시 제거한다

```jsx
npm cache clean --force
```

6. vscode 를 다시 연다.\*
</details>

<details>![title](https://myurl.ai/zca36P)   
![title](https://myurl.ai/zca36P)   
<summary>멀티 파일 업로드 미들웨어 
</summary>

nest는 일반적으로 fileInterceptor 이용해서 파일 처리를 하지만 기존에 만든 미들웨어를 재사용을 해서 구현, 이 때 s3 업로드에 걸어놓은 유효성검사(파일 용량 및 최대 업로드 개수)에 만족하지 않는 다면 걸어둔 try ~catch문 내의 에러로 들어가는 게 아닌 서버 오류가 나버리는 현상으로 해당 오류를 수정하는데 시간이 좀 걸렸었다.

</details>

<details><summary> sql에 저장된 date를 한국 시간으로 변경
</summary>

저장된 date는 UTC기준이여서 한국 시간으로 바꾸기 위해선 offset을 9시간으로 준 시간을 더하는 간단한 문제 였는데, 더하고 toISOString() 메서드를 사용하면 다시 UTC시간으로 돌아가는 문제로 시간이 좀 걸렸었다(toTimeString, toDateString은 전부 offset이 적용된 한국 시간으로 잘 표시 되었는데 toISOString만 문제)

</details>

<details><summary>그룹 대화창 구현
</summary>

- 템플릿을 이용했는데 해당 템플릿의 html은 여러 페이지가 아닌 한 페이지에 모든 그룹 대화창이 설계가 되어야 하고 채팅 목록과 참여 인원 정보 등이 포함이 되어야 있어야 해서 어떻게 이 전체 부분을 최대한 대기 시간 없이 가져 오게 하는지에 대해 로직을 고민하고 적용하는 데 시간이 걸렸었다.
</details>
