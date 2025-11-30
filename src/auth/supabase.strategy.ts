import { Injectable, UseGuards } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

const jwtSecret = process.env.SUPABASE_JWT_SECRET;

if(!jwtSecret){
    throw new Error("O secret JWT do supabase não existe")
}
@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
    
    constructor() {
    super({
      // Onde procurar o token (Cabeçalho Authorization: Bearer <token>)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // A chave secreta para validar se o token é real
      secretOrKey: jwtSecret!,
    });
    } 
    async validate(payload: any){
        //O payload é o conteúdo descriptografado do token

        return {
            userId: payload.sub,
            email: payload.email
        }
    }

}