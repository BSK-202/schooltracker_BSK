import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            secretOrKey: 'ACCESS_SECRET',

            algorithms: ['HS256'],
            ignoreExpiration: false,

        });
    }

    validate(payload: any) {
        return payload;
    }

}