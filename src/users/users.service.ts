import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/LoginUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { name, username, email, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const findUser = await this.userModel.findOne({ email });
    if (findUser) throw new UnauthorizedException('User already exists');

    const usernameExists = await this.userModel.findOne({ username });
    if (usernameExists)
      throw new UnauthorizedException('Username already exists');

    const newUser = await this.userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: newUser._id });

    return { token };
  }

  async loginUser(LoginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { email, password } = LoginUserDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }

  getUsers() {
    return this.userModel.find();
  }

  getUserById(id: string) {
    return this.userModel.findById(id);
  }

  updateUser(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id, { new: true });
  }
}
