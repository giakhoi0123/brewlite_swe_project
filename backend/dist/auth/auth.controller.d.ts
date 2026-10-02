import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(input: RegisterDto): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            loyaltyPoints: number;
        };
        accessToken: string;
    }>;
    login(input: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            loyaltyPoints: number;
        };
        accessToken: string;
    }>;
}
