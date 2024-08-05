import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'updated_john_doe',
    description: 'The new username of the user',
  })
  username: string;
}
