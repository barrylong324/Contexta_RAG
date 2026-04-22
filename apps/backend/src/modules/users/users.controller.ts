import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ResponseDto } from '@rag-ai/shared-types'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getCurrentUser(): Promise<ResponseDto<any>> {
        // Will be implemented with request user from JWT
        const data = { message: 'Get current user endpoint' }
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async getUserById(@Param('id') id: string): Promise<ResponseDto<any>> {
        const data = await this.usersService.findById(id)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }
}
