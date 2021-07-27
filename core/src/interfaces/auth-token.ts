import { UserDto } from '@dtos/user.dto';

export interface AuthToken {
  access_token?: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  expires?: number;

  user?: UserDto;
}
