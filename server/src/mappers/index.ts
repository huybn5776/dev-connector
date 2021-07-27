import { classes } from '@automapper/classes';
import { createMapper } from '@automapper/core';

import { postMappingProfile } from '@mappers/post-mapping-profile';
import { profileMappingProfile } from '@mappers/profile-mapping-profile';
import { userMappingProfile } from '@mappers/user-mapping-profile';

export const mapper = createMapper({
  name: 'mapper',
  pluginInitializer: classes,
});

mapper
  .addProfile(userMappingProfile)
  .addProfile(profileMappingProfile)
  .addProfile(postMappingProfile);
