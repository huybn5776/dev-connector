import bcrypt from 'bcrypt';
import * as gravatar from 'gravatar';

import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { User } from '@entities/user';
import HttpException from '@exceptions/http-exception';
import { mapper } from '@mappers';
import { UserDocument, UserModel } from '@models/user.model';

class UserService {
  public users = UserModel;

  public async findAllUser(): Promise<User[]> {
    return (await this.users.find()).map((user) => user.toObject());
  }

  public async findUserById(id: string): Promise<User> {
    const user = await this.users.findById(id).select('-password');
    if (!user) {
      throw new HttpException(404);
    }

    return user.toObject();
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const existingUser: UserDocument | null = await this.users.findOne({
      $or: [{ username: userData.username }, { email: userData.email }],
    });
    if (existingUser) {
      throw new HttpException(
        409,
        `This ${existingUser.username === userData.username ? 'username' : 'email address'} is already being used`,
      );
    }
    const avatar = this.generateGravatarUrl(userData.email);
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = mapper.map(userData, User, CreateUserDto);
    const userDocument = await this.users.create({
      ...user,
      password: hashedPassword,
      avatar,
    });

    return userDocument.toObject();
  }

  public async patchUser(userId: string, userData: PatchUserDto): Promise<User> {
    const userDocument: UserDocument | null = await this.users.findById(userId);
    if (!userDocument) {
      throw new HttpException(404);
    }

    if (userData.password && !userData.originalPassword) {
      throw new HttpException(400).withValidationError<PatchUserDto>({
        originalPassword: 'Original password is required when changing password',
      });
    }

    if (userData.fullName) {
      userDocument.fullName = userData.fullName;
    }

    if (userData.email && userData.email !== userDocument.email) {
      const userWithSameEmail = await this.users.findOne({ email: userData.email });
      if (userWithSameEmail && userWithSameEmail._id !== userId) {
        throw new HttpException(409, `This email address is already being used`);
      }
      userDocument.email = userData.email;
      userDocument.avatar = this.generateGravatarUrl(userData.email);
    }

    if (userData.password && userData.originalPassword) {
      const isPasswordMatch = await bcrypt.compare(userData.originalPassword, userDocument.password);
      if (!isPasswordMatch) {
        throw new HttpException(400).withValidationError<PatchUserDto>({
          originalPassword: 'Original password is incorrect',
        });
      }
      userDocument.password = await bcrypt.hash(userData.password, 10);
    }

    await userDocument.save();
    return userDocument.toObject();
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
