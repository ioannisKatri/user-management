import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'password123',
    description: 'The current password of the user',
  })
  currentPassword: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'The new password of the user',
  })
  newPassword: string;
}
