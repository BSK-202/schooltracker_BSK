import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    login(username : string , password : string) : string{
        return "Bonjour "+username+" vous etes connecte";
    }
}
