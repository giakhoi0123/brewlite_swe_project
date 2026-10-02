import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
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
    private signToken;
}
