import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    info(): any {
        const response = {
            message: "Info recupere avec succes",
            profil: {
                name: 'Mohamed Ali',
                phone: '0611111111',
                child: 'Fatima (CM2)',
                bus: 'Ligne 12A',
                role: 'Parent'
            },
        }
        console.log("Info::fromBack"+response);

        return response;
    }
    private users: User[] = [{ phone: "0611111111", password: "password", role: "admin" }];

    constructor(private readonly jwtService: JwtService) { }

    login(body: { phone: string, password: string }): any {
        if (!body.phone || !body.password) {
            return "Email or password is missing";
        }

        const user = this.users.find(
            (u) => u.phone === body.phone && u.password === body.password
        );
        if (!user) {
            return "Invalid credentials";
        }

        const payload = {
            phone: user.phone,
            role: user.role,
        };

        const acces_token = this.jwtService.sign(payload);
        const response = {
            message: "Connexion reussie",
            acces_token,
        }
        console.log(response);
        return response;
    }
}
