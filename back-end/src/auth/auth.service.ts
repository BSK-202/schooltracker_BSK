import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    private users :User[]=[{phone:"06232234", password: "password",role:"admin"}]; 

    constructor( private readonly jwtService: JwtService ) {}
    
    login(body:{phone : string , password : string}) : any{
        if(!body.phone || !body.password){
            return "Email or password is missing";
        }

        const user = this.users.find(
            (u)=> u.phone === body.phone && u.password === body.password
        );
        if(!user){
            return "Invalid credentials";
        }

        const payload = {
            phone: user.phone,
            role: user.role,
        };

        const acces_token = this.jwtService.sign(payload);
        return acces_token;
    }


}
