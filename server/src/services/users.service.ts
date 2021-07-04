import bcrypt from 'bcrypt';
import * as gravatar from 'gravatar';

import { CreateUserDto } from '@dtos/create-user.dto';
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

  public async createUser(userData: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.users.findOne({ email: userData.email });
    if (existingUser) {
      throw new HttpException(409, `This email address is already being used`);
    }
    const avatar = gravatar.url(userData.email, {
      s: '200',
      r: 'pg',
      d: 'mm',
    });
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.users.create({ ...userData, password: hashedPassword, avatar });
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<UserDocument> {
    let updatingUserData = { ...userData };
    if (updatingUserData.email) {
      const userWithSameEmail = await this.users.findOne({ email: updatingUserData.email });
      if (userWithSameEmail && userWithSameEmail._id !== userId) {
        throw new HttpException(409, `This email address is already being used`);
      }
    }

    if (updatingUserData.password) {
      const hashedPassword = await bcrypt.hash(updatingUserData.password, 10);
      updatingUserData = { ...updatingUserData, password: hashedPassword };
    }

    const updatedUser = await this.users.findByIdAndUpdate(
      userId,
      { userData: updatingUserData },
      { runValidators: true },
    );
    if (!updatedUser) {
      throw new HttpException(404);
    }

    return updatedUser;
  }

  public async deleteUser(userId: string): Promise<UserDocument> {
    const deletingUser = await this.users.findByIdAndDelete(userId);
    if (!deletingUser) {
      throw new HttpException(404);
    }
    return deletingUser;
  }
}

export default UserService;
