import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces/';


@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger('MessagesWsGateway');

  @WebSocketServer() wss: Server;

  constructor( 
    private readonly messagesWsService: MessagesWsService,
    private readonly JwtService : JwtService
   ) {}

  async handleConnection(client: Socket ) {
   const token =  client.handshake.headers.authentication as string;
   let payload: JwtPayload;

   try {
     payload = this.JwtService.verify( token );
     await this.messagesWsService.registerClient( client, payload.id )    
   } catch (error) {
      this.logger.error( error )
      client.disconnect()
      return;
   }
    
    

     //mandando el id de los clientes conectados a todos los clientes conectados
     this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())

     //!Esto une a el cliente conectado a una sala
      //client.join('ventas')
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient( client.id );
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  
  @SubscribeMessage('message-client')
  onMessageClient( client : Socket, payload : NewMessageDto ) {

    //! esto emite unicamente al cliente que mando el mensaje
      // client.emit('messages-server', {
      //   fullname: client.id, 
      //   message: payload.message || 'no-message'
      // })

    //! esto emite a todos al cliente menos al cliente que mando el mensaje
      // client.broadcast.emit('messages-server', {
      //   fullname: client.id, 
      //   message: payload.message || 'no-message'
      // })

      //!Esto emite los mensajes solo a la sala seleccionada
      // this.wss.to('ventas').emit('messages-server', {
      //   fullname: client.id, 
      //   message: payload.message || 'no-message'
      // })

      //! esto emite a todos 
       this.wss.emit('messages-server', {
        fullname: this.messagesWsService.getUserFullnamebySocketId( client.id ), 
        message: payload.message || 'no-message'
      })
  }


}
