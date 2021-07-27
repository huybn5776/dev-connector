import type { MappingProfile } from '@automapper/types';

import { mapId } from '@/utils/mapper-utils';
import { UserDto } from '@dtos/user.dto';
import { User } from '@entities/user';

export const userMappingProfile: MappingProfile = (mapper) => {
  mapper.createMap(User, UserDto).forMember(...mapId());
};
