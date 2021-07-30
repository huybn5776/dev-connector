import bcrypt from 'bcrypt';
import * as gravatar from 'gravatar';
import * as R from 'ramda';

import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { User } from '@entities/user';
import HttpException from '@exceptions/http-exception';
import { UserDocument, UserModel } from '@models/user.model';

class UserService {
  public users = UserModel;

  public async findAllUser(): Promise<UserDocument[]> {
    return this.users.find().select('-password');
  }

  public async findUserById(id: string): Promise<UserDocument> {
    const user = await this.users.findById(id).select('-password');
    if (!user) {
      throw new HttpException(404);
    }

    return user;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const existingUser = await this.users.findOne({ email: userData.email });
    if (existingUser) {
      throw new HttpException(409, `This email address is already being used`);
    }
    const avatar = this.generateGravatarUrl(userData.email);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userDocument = await this.users.create({ ...userData, password: hashedPassword, avatar });
    const user = userDocument.toObject();
    return R.omit(['password', '__v'], user) as User;
  }

  public async patchUser(userId: string, userData: PatchUserDto): Promise<UserDocument> {
    const userDocument: UserDocument | null = await this.users.findById(userId);
    if (!userDocument) {
      throw new HttpException(404);
    }

    if (userData.name) {
      userDocument.name = userData.name;
    }

    if (userData.email && userData.email !== userDocument.email) {
      const userWithSameEmail = await this.users.findOne({ email: userData.email });
      if (userWithSameEmail && userWithSameEmail._id !== userId) {
        throw new HttpException(409, `This email address is already being used`);
      }
      userDocument.email = userData.email;
      userDocument.avatar = this.generateGravatarUrl(userData.email);
    }

    if (userData.password) {
      userDocument.password = await bcrypt.hash(userData.password, 10);
    }

    await userDocument.save();
    return userDocument;
  }

  public async deleteUser(userId: string): Promise<UserDocument> {
    const deletingUser = await this.users.findByIdAndDelete(userId);
    if (!deletingUser) {
      throw new HttpException(404);
    }
    return deletingUser;
  }

  private generateGravatarUrl(email: string): string {
    return gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
  }
}

export default UserService;
