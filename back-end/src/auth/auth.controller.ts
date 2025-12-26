import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    
    @Post('login')
    login(@Body() body:{phone: string, password: string}){
    //console.log(body)
    const {phone, password}= body;
    return this.authService.login(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get("profil")
    info(){
        console.log("controller profil");
        return this.authService.info();
    }
}
