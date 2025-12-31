import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
        constructor(
            private readonly jwtService: JwtService,
            private readonly userService: UserService
        ) { }

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
        console.log("Info::fromBack" + response);

        return response;
    }
    private users: User[] = [{ phone: "0611111111", password: "password", full_name: "Mohamed Ali", role: "admin", refreshToken: "" }];

   

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

        const access_token = this.jwtService.sign(payload, {
            secret: 'ACCESS_SECRET',
            expiresIn: '2m',
        });

        const refresh_token = this.jwtService.sign(payload, {
            secret: 'REFRESH_SECRET',
            expiresIn: '5m',
        });
        const hashed = bcrypt.hash(refresh_token, 10);

        // on le garde côté serveur
        user.refreshToken = hashed;

        const response = {
            message: "Connexion reussie",
            access_token,
            refresh_token,

        }

        console.log(response);
        return response;
    }

    async refresh(refreshToken: string) {
        try {
            // 1️⃣ Vérifier la signature
            const payload = this.jwtService.verify(refreshToken, {
                secret: 'REFRESH_SECRET',
            });

            // 2️⃣ Retrouver l’utilisateur
            const user = this.users.find(u => u.phone === payload.phone);
            if (!user || !user.refreshToken) {
                throw new Error();
            }

            // 3️⃣ Vérifier que le refresh token correspond à celui stocké
            const isValid = await bcrypt.compare(
                refreshToken,
                user.refreshToken,
            );
            if (!isValid) {
                throw new Error();
            }

            // 4️⃣ Générer nouveaux tokens (ROTATION)
            const newAccessToken = this.jwtService.sign(payload, {
                secret: 'ACCESS_SECRET',
                expiresIn: '15m',
            });

            const newRefreshToken = this.jwtService.sign(payload, {
                secret: 'REFRESH_SECRET',
                expiresIn: '7d',
            });

            // 5️⃣ Mettre à jour le refresh token stocké
            user.refreshToken = await bcrypt.hash(newRefreshToken, 10);

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };

        } catch {
            console.log("Erreur lors de refresh token");
        }
    }

    async register(body:User){
        const {phone, password, full_name, role} = body;
        const existingUser = await this.userService.findByPhone(phone);
        if(existingUser){
            throw new ConflictException('Phone number already in use');
        }
        await this.userService.create({
            phone,
            password,
            full_name,
            role
        });
        return {message: "User created successfully"};
    }
}
