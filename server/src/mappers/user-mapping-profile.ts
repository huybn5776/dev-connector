import { ignore } from '@automapper/core';
import type { MappingProfile } from '@automapper/types';

import { mapId } from '@/utils/mapper-utils';
import { CreateUserDto } from '@dtos/create-user.dto';
import { UserDto } from '@dtos/user.dto';
import { User } from '@entities/user';

export const userMappingProfile: MappingProfile = (mapper) => {
  mapper
    .createMap(CreateUserDto, User)
    .forMember((source) => source.password, ignore());
  mapper.createMap(User, UserDto).forMember(...mapId());
};
