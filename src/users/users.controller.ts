import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { LoginUserDto } from './dto/LoginUser.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ token: string }> {
    const { token } = await this.usersService.createUser(createUserDto);
    res.cookie('jwt', token, { httpOnly: true });
    return { token };
  }

  @Post('/login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ token: string }> {
    const { token } = await this.usersService.loginUser(loginUserDto);
    res.cookie('jwt', token, { httpOnly: true });
    return { token };
  }

  @Get()
  async getUsers() {
    return await this.usersService.getUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.usersService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const updateUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updateUser) throw new HttpException('User not found', 404);
    return updateUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const deleteUser = await this.usersService.deleteUser(id);
    if (!deleteUser) throw new HttpException('User not found', 404);
    return;
  }
}
