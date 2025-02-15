import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUserByName(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  getUserById(id: ObjectId | string) {
    return this.userModel.findById(id).exec();
  }

  async validateUser(id: ObjectId | string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new UnauthorizedException('Unable to find user');
    }

    return user;
  }

  async getUser(username: string) {
    const user =
      (await this.getUserByName(username)) ??
      (await this.getUserByEmail(username));

    if (!user) {
      return null;
    }

    return user;
  }

  async getFilteredUser(username: string) {
    const user = await this.getUser(username);

    if (!user) {
      return null;
    }

    return this.filterUser(user);
  }

  filterUser(user: User) {
    const userObject = JSON.parse(JSON.stringify(user));

    delete userObject.password;

    return userObject;
  }

  create(body: RegisterDto) {
    return new this.userModel(body).save();
  }
}
