import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from '@rag-ai/shared-types'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ResponseDto<any>> {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password)
        const result = await this.authService.login(user)

        // Set token in response header for easy access in browser DevTools
        res.setHeader('Authorization', `Bearer ${result.access_token}`)
        res.setHeader('Access-Control-Expose-Headers', 'Authorization')

        return {
            code: HttpStatus.OK,
            message: '登录成功',
            result,
        }
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<any>> {
        const data = await this.authService.register(registerDto)
        return {
            code: HttpStatus.OK,
            message: '注册成功，请登录~',
            result: data,
        }
    }
}
