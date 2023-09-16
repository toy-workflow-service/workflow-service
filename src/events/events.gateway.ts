import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from 'src/_common/security/jwt/jwt.service';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;

  connectedClients: { [socketId: string]: number } = {};
  clientName: { [socketId: string]: string } = {};
  roomUsers: { [key: string]: string[] } = {};

  handleConnection(@ConnectedSocket() client: Socket): Promise<any> {
    const authorization = client.request.headers.cookie;
    if (!authorization) return;
    let regExp = new RegExp(/^[refreshToken=]/);
    let token: string;

    authorization.split(' ').forEach((value) => {
      if (regExp.exec(value)) {
        token = value;
        token = token.replace('refreshToken=', '');
        token = token.replace(';', '');
      }
    });

    const decode = this.jwtService.verify(token, process.env.REFRESH_SECRET_KEY);
    this.connectedClients[client.id] = Number(decode.id);
    console.log(this.connectedClients);
  }

  handleDisconnect(client: Socket) {
    delete this.connectedClients[client.id];
    delete this.roomUsers[this.clientName[client.id]];

    //클라이언트 연결 종료 시 해당 클라이언트가 속한 모든 방에서 유저를 제거
    Object.keys(this.roomUsers).forEach((room) => {
      const index = this.roomUsers[room]?.indexOf(this.clientName[client.id]);
      if (index !== -1) {
        this.roomUsers[room] = this.roomUsers[room].slice(0, index).concat(this.roomUsers[room].slice(index + 1));
        this.server.to(room).emit('leaveRoom');
      }
    });
    delete this.clientName[client.id];
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: any): void {
    const room = data.room;
    const name = data.name;
    this.clientName[client.id] = name;
    if (client.rooms.has(room)) return;

    client.join(room);
    if (!this.roomUsers[room]) this.roomUsers[room] = [];

    this.roomUsers[room].push(this.clientName[client.id]);
    this.server.to(room).emit('userList', { room, userList: this.roomUsers[room] });

    this.server.emit('userList', { room: null, userList: Object.keys(this.connectedClients) });
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    client: Socket,
    data: {
      messageId: string;
      message: string;
      room: string;
      boardName: string;
      date: string;
      profileUrl: string;
      fileUpload: boolean;
      sendUserId: string;
    }
  ): void {
    this.server.to(data.room).emit('chatMessage', {
      userId: this.connectedClients[client.id],
      userName: this.clientName[client.id],
      messageId: data.messageId,
      message: data.message,
      room: data.room,
      boardName: data.boardName,
      date: data.date,
      profileUrl: data.profileUrl,
      fileUpload: data.fileUpload,
      sendUserId: data.sendUserId,
    });
  }

  @SubscribeMessage('chatPrivateMessage')
  handleChatPrivateMessage(
    client: Socket,
    data: {
      messageId: string;
      message: string;
      room: string;
      roomName: string;
      date: string;
      profileUrl: string;
      fileUpload: boolean;
      receiverId: string;
    }
  ): void {
    this.server.to(data.room).emit('chatPrivateMessage', {
      userId: this.connectedClients[client.id],
      userName: this.clientName[client.id],
      messageId: data.messageId,
      message: data.message,
      room: data.room,
      roomName: data.roomName,
      date: data.date,
      profileUrl: data.profileUrl,
      fileUpload: data.fileUpload,
      receiverId: data.receiverId,
    });
  }

  @SubscribeMessage('newMessage')
  announceNewMessage(
    client: Socket,
    data: {
      message: string;
      room: string;
      boardName: string;
      date: string;
      profileUrl: string;
    }
  ): void {
    this.server.to(data.room).emit('newMessage', {
      message: data.message,
      room: data.room,
      boardName: data.boardName,
      date: data.date,
      profileUrl: data.profileUrl,
    });
  }

  @SubscribeMessage('newPrivateMessage')
  announceNewPrivateMessage(
    client: Socket,
    data: {
      receiverId: string;
      room: string;
      userName: string;
      date: string;
    }
  ): void {
    let user = [];

    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.receiverId)) {
        user.push(key);
      }
    }

    user.forEach((sock) => {
      this.server.to(sock).emit('newPrivateMessage', { room: data.room, userName: data.userName, date: data.date });
    });
  }

  @SubscribeMessage('inviteWorkspace')
  inviteWorkspaceMessage(
    client: Socket,
    data: {
      userId: string;
      workspaceName: string;
      date: string;
    }
  ): void {
    let user = [];

    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.userId)) {
        user.push(key);
      }
    }

    user.forEach((sock) => {
      this.server.to(sock).emit('inviteWorkspaceMessage', { workspaceName: data.workspaceName, date: data.date });
    });
  }

  @SubscribeMessage('inviteBoard')
  inviteBoardMessage(
    client: Socket,
    data: {
      userId: string;
      workspaceId: string;
      boardName: string;
      date: string;
    }
  ): void {
    let user = [];

    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.userId)) {
        user.push(key);
      }
    }

    user.forEach((sock) => {
      this.server.to(sock).emit('inviteBoardMessage', {
        workspaceId: data.workspaceId,
        boardName: data.boardName,
        date: data.date,
      });
    });
  }

  @SubscribeMessage('inviteCard')
  inviteCardMessage(
    client: Socket,
    data: {
      userId: string;
      boardId: string;
      cardName: string;
      date: string;
    }
  ): void {
    let user = [];

    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.userId)) {
        user.push(key);
      }
    }

    user.forEach((sock) => {
      this.server.to(sock).emit('inviteCardMessage', {
        boardId: data.boardId,
        cardName: data.cardName,
        date: data.date,
      });
    });
  }

  @SubscribeMessage('typingMessage')
  handleTypingMessage(client: Socket, data: { room: string; receiverId: string; message: string }) {
    let user = [];
    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.receiverId)) {
        user.push(key);
      }
    }
    user.forEach((sock) => {
      this.server.to(sock).emit('typingMessage', {
        room: data.room,
        message: data.message,
      });
    });
  }

  @SubscribeMessage('existTypingMessage')
  handleDeleteTypingMessage(client: Socket, data: { room: string; senderId: string; receiverId: string }) {
    let user = [];
    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.receiverId)) {
        user.push(key);
      }
    }
    user.forEach((sock) => {
      this.server.to(sock).emit('existTypingMessage', {
        room: data.room,
        senderId: client.id,
      });
    });
  }

  @SubscribeMessage('existTypinginital')
  handdleTypingInital(client: Socket, data: { room: string; senderId: string; result: string }) {
    this.server.to(data.senderId).emit('existTypinginital', {
      room: data.room,
      result: data.result,
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////
  @SubscribeMessage('existUser')
  handleExistUserMessage(client: Socket, data: { senderId: string }) {
    const room = `callRoom${data.senderId}`;
    let result: boolean;

    if (!this.roomUsers[room]) this.roomUsers[room] = [];
    if (this.roomUsers[room].includes(String(this.connectedClients[client.id]))) {
      result = true;
    } else result = false;

    this.server.to(client.id).emit('duplicateEntry', { result, callRoomId: room });
  }

  @SubscribeMessage('inviteVideoCall')
  handleAcceptCall(
    client: Socket,
    data: { senderId: string; senderName: string; receiverId: string; receiverName: string }
  ) {
    const room = `callRoom${data.senderId}`;
    this.clientName[client.id] = data.senderId;

    if (client.rooms.has(room)) return;

    client.join(room);
    this.roomUsers[room].push(this.clientName[client.id]);

    let user = [];
    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.receiverId)) {
        user.push(key);
      }
    }
    if (user.length) {
      user.forEach((sock) => {
        this.server.to(sock).emit('inviteVideoCall', {
          callRoomId: room,
          senderId: data.senderId,
          senderName: data.senderName,
          receiverId: data.receiverId,
          receiverName: data.receiverName,
        });
      });
    } else {
      this.server.to(client.id).emit('notLogIn');
    }
  }

  @SubscribeMessage('refuseVideoCall')
  handleRefuseVideoCall(client: Socket, data: { callRoomId: string; senderId: string }) {
    let user = [];

    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.senderId)) {
        user.push(key);
      }
    }

    this.roomUsers[data.callRoomId] = [];

    user.forEach((sock) => {
      this.server.to(sock).emit('refuseVideoCall', {
        receiverName: this.clientName[client.id],
      });
    });
  }

  @SubscribeMessage('callRoomJoin')
  handleJoinMessage(
    client: Socket,
    data: { callRoomId: string; senderId: string; senderName: string; receiverId: string; receiverName: string }
  ) {
    const room = data.callRoomId;
    this.clientName[client.id] = data.senderId;
    if (client.rooms.has(room)) return;

    client.join(room);
    if (!this.roomUsers[room]) this.roomUsers[room] = [];
    this.roomUsers[room].push(this.clientName[client.id]);

    client.broadcast.to(room).emit('callRoomEnter', {
      userId: client.id,
      callRoomId: data.callRoomId,
    });
  }

  @SubscribeMessage('callOffer')
  handleOfferMessage(client: Socket, data: { offer: any; callRoomId: string }) {
    client.broadcast
      .to(data.callRoomId)
      .emit('callRoomOffer', { userId: client.id, offer: data.offer, callRoomId: data.callRoomId });
  }

  @SubscribeMessage('callAnswer')
  handleAnswerMessage(client: Socket, data: { answer: any; toUserId: string; callRoomId: string }) {
    client.broadcast
      .to(data.callRoomId)
      .emit('callRoomAnswer', { userId: client.id, answer: data.answer, toUserId: data.toUserId });
  }

  @SubscribeMessage('callIceCandidate')
  handleCandidateMessage(client: Socket, data: { candidate: any; callRoomId: string }) {
    client.broadcast.to(data.callRoomId).emit('callIceCandidate', { userId: client.id, candidate: data.candidate });
  }

  @SubscribeMessage('shareScreen')
  handleShareScreenMessage(client: Socket, data: { captureStream: any; callRoomId: string; userId: string }) {
    let user = [];

    for (let key in this.connectedClients) {
      if (this.connectedClients[key] === Number(data.userId)) {
        user.push(key);
      }
    }

    user.forEach((sock) => {
      this.server.to(sock).emit('shareScreen', {
        captureStream: data.captureStream,
      });
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoomMessage(client: Socket, data: { callRoomId: string }) {
    //소켓 연결이 끊기면 자동으로 방도 나가지는 로직이 있기에 추가 로직은 작성x
    client.broadcast.to(data.callRoomId).emit('leaveRoom');
  }
}
