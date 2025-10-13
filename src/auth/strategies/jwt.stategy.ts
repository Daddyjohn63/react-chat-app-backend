import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../token-payload.interface';

interface CookieRequest extends Request {
  cookies: {
    Authentication: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: CookieRequest) => request.cookies.Authentication,
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: TokenPayload): TokenPayload {
    return payload;
  }
}
