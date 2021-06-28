import bcrypt from 'bcrypt';

import { CreateUserDto } from '@dtos/users.dto';
import HttpException from '@exceptions/http-exception';
import { User } from '@interfaces/users';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';

class UserService {
  public users = userModel;

  public async findAllUser(): Promise<User[]> {
    return this.users.find();
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) {
      throw new HttpException(400, 'You\'re not userId');
    }

    const findUser = await this.users.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, 'You\'re not user');

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const existingUser = await this.users.findOne({ email: userData.email });
    if (existingUser) {
      throw new HttpException(409, `You're email ${userData.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.users.create({ ...userData, password: hashedPassword });
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) {
      throw new HttpException(400, 'You\'re not userData');
    }

    let updatingUserData = { ...userData };
    if (updatingUserData.email) {
      const findUser = await this.users.findOne({ email: updatingUserData.email });
      if (findUser && findUser._id !== userId) {
        throw new HttpException(409, `You're email ${updatingUserData.email} already exists`);
      }
    }

    if (updatingUserData.password) {
      const hashedPassword = await bcrypt.hash(updatingUserData.password, 10);
      updatingUserData = { ...updatingUserData, password: hashedPassword };
    }

    const updateUserById = await this.users.findByIdAndUpdate(userId, { userData: updatingUserData });
    if (!updateUserById) {
      throw new HttpException(409, 'You\'re not user');
    }

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById = await this.users.findByIdAndDelete(userId);
    if (!deleteUserById) {
      throw new HttpException(409, 'You\'re not user');
    }

    return deleteUserById;
  }
}

export default UserService;
