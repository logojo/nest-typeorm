import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';



interface ConnetedClients {
  [id: string]: {
    socket: Socket,
    user: User,
  }
}


@Injectable()
export class MessagesWsService {
    private conectedClients : ConnetedClients = {};

    constructor (
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {

    }

   async registerClient( client : Socket, userId: string ) {
       const user = await this.userRepository.findOneBy({ id: userId}) 
       
       if( !user ) throw new Error('User not found ')
          
       if( !user.isActive ) throw new Error('User not active ')
        
       
       this.checkUserConnection( user )
           
       this.conectedClients[client.id] = {
        socket: client,
        user
       }
    }

    removeClient( clientId : string ) {
        delete this.conectedClients[clientId]
    }

    getConnectedClients() : string [] {
     return Object.keys(this.conectedClients)
    }

    getUserFullnamebySocketId( socketId : string) {
        return this.conectedClients[socketId].user.fullname
    }

    private checkUserConnection( user : User ) {
        for( const clientId of Object.keys( this.conectedClients ) ){
            const connetedClient = this.conectedClients[clientId]

            if( connetedClient.user.id === user.id ){
                connetedClient.socket.disconnect();
                break;
            }
        }
    }

}

