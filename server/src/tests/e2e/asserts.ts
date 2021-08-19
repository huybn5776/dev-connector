import { idToString } from '@/tests/e2e/e2e-utils';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileSocialDto } from '@dtos/profile-social.dto';
import { ProfileDto } from '@dtos/profile.dto';
import { UserDto } from '@dtos/user.dto';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import { User } from '@entities/user';

export function assertUser(userDto: UserDto | undefined, user: User | undefined): void {
  expect(userDto?.id).toBe(`${user?._id}`);
  expect(userDto?.name).toBe(user?.name);
  expect(userDto?.avatar).toBe(user?.avatar);
}

export function assertDate(
  actual: number | string | Date | undefined,
  expected: number | string | Date | undefined,
): void {
  const toIsoString = (date: number | string | Date | undefined): string | undefined => {
    if (typeof date === 'number') {
      return new Date(date).toISOString();
    }
    if (typeof date === 'string') {
      return date;
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return undefined;
  };

  expect(toIsoString(actual)).toBe(toIsoString(expected));
}

export function assertComment(commentDto: PostCommentDto, comment: PostComment): void {
  expect(commentDto.text).toBe(comment.text);
  expect(commentDto.name).toBe(comment.name);
  expect(commentDto.avatar).toBe(comment.avatar);
  assertUser(commentDto.user, comment.user);

  expect(commentDto.likes).toHaveLength(comment.likes.length);
}

export function assertListingLikes(postLikesDto: PostLikeDto[], postLikes: PostLike[]): void {
  expect(postLikesDto).toHaveLength(postLikes.length);

  for (let i = 0; i < postLikes.length; i += 1) {
    const postLikeDto = postLikesDto[i];
    const postLike = postLikes[i];
    expect(postLikeDto.user.id).toBe(`${postLike.user._id}`);

    // should not have detail information in listing api
    expect(postLikeDto.user.name).not.toBeDefined();
    expect(postLikeDto.user.email).not.toBeDefined();
    expect(postLikeDto.user.avatar).not.toBeDefined();
  }
}

export function assertProfile(
  actual: Omit<ProfileDto, 'id' | 'user' | 'experiences' | 'educations' | 'createdAt' | 'updatedAt'> & {
    user?: { id?: string; _id?: string };
  },
  expected: Omit<ProfileDto, 'id' | 'user' | 'experiences' | 'educations' | 'createdAt' | 'updatedAt'> & {
    user?: { id?: string; _id?: string };
  },
): void {
  expect(actual.user).toHaveSameId(expected.user);
  expect(actual.company ?? null).toBe(expected.company ?? null);
  expect(actual.website ?? null).toBe(expected.website ?? null);
  expect(actual.location ?? null).toBe(expected.location ?? null);
  expect(actual.status ?? null).toBe(expected.status ?? null);
  expect(new Set(actual.skills) ?? null).toEqual(new Set(expected.skills) ?? null);
  expect(actual.bio ?? null).toBe(expected.bio ?? null);
  expect(actual.githubUsername ?? null).toBe(expected.githubUsername ?? null);
  assertProfileSocial(actual.social, expected.social);
}

export function assertProfileExperiences(
  actual: (ProfileExperienceDto | ProfileExperience)[],
  expected: (ProfileExperienceDto | ProfileExperience)[],
): void {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    assertProfileExperience(actual[i], expected[i]);
  }
}

export function assertProfileEducations(
  actual: (ProfileEducationDto | ProfileEducation)[],
  expected: (ProfileEducationDto | ProfileEducation)[],
): void {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    assertProfileEducation(actual[i], expected[i]);
  }
}

export function assertProfileExperience(
  actual: ProfileExperienceDto | ProfileExperience,
  expected: ProfileExperienceDto | ProfileExperience,
): void {
  expect(actual.title ?? null).toBe(expected.title ?? null);
  expect(actual.company ?? null).toBe(expected.company ?? null);
  expect(actual.location ?? null).toBe(expected.location ?? null);
  assertDate(expected.from, actual.from);
  assertDate(expected.to, actual.to);
  expect(actual.current ?? null).toBe(expected.current ?? null);
  expect(actual.description ?? null).toBe(expected.description ?? null);
}

export function assertProfileEducation(
  actual: ProfileEducationDto | ProfileEducation,
  expected: ProfileEducationDto | ProfileEducation,
): void {
  expect(expected.school ?? null).toBe(actual.school ?? null);
  expect(expected.degree ?? null).toBe(actual.degree ?? null);
  expect(expected.fieldOfStudy ?? null).toBe(actual.fieldOfStudy ?? null);
  assertDate(expected.from, actual.from);
  assertDate(expected.to, actual.to);
  expect(expected.current ?? null).toBe(actual.current ?? null);
  expect(expected.description ?? null).toBe(actual.description ?? null);
}

export function assertProfileSocial(actual: ProfileSocialDto | undefined, expected: ProfileSocialDto | undefined): void {
  expect(actual?.youtube ?? null).toBe(expected?.youtube ?? null);
  expect(actual?.twitter ?? null).toBe(expected?.twitter ?? null);
  expect(actual?.facebook ?? null).toBe(expected?.facebook ?? null);
  expect(actual?.linkedin ?? null).toBe(expected?.linkedin ?? null);
  expect(actual?.instagram ?? null).toBe(expected?.instagram ?? null);
}
