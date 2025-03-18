// users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-multiple')
  @ApiOperation({ summary: 'Created users' })
  @ApiResponse({ status: 200, description: 'Users created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({
    schema: {
      type: 'array',
      properties: {
        name: {
          type: 'string',
          example: 'Juan',
        },
        lastname: {
          type: 'string',
          example: 'Perez',
        },
        email: {
          type: 'string',
          example: 'juan.perez@example.com',
        },
        link: {
          type: 'string',
          example: 'https://www.facebook.com/juan.perez',
        },
        extractedData: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              example: 'Facebook',
            },
            username: {
              type: 'string',
              example: 'juan.perez',
            },
            profileImage: {
              type: 'string',
              example: 'https://example.com/profile.jpg',
            },
            bio: {
              type: 'string',
              example: 'Aquí va la biografía.',
            },
            email: {
              type: 'string',
              example: 'juan.perez@example.com',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                example: 'https://example.com/image1.jpg',
              },
            },
          },
        },
        labels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                example: 'Profile description',
              },
              score: {
                type: 'number',
                example: 0.95,
              },
            },
          },
        },
      },
    },
  })
  createMultipleUsers(@Body() createUserDtos: CreateUserDto[]) {
    return this.usersService.createMultiple(createUserDtos);
  }
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 200, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Juan',
        },
        lastname: {
          type: 'string',
          example: 'Perez',
        },
        email: {
          type: 'string',
          example: 'juan.perez@example.com',
        },
        link: {
          type: 'string',
          example: 'https://www.facebook.com/juan.perez',
        },
        extractedData: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              example: 'Facebook',
            },
            username: {
              type: 'string',
              example: 'juan.perez',
            },
            profileImage: {
              type: 'string',
              example: 'https://example.com/profile.jpg',
            },
            bio: {
              type: 'string',
              example: 'Aquí va la biografía.',
            },
            email: {
              type: 'string',
              example: 'juan.perez@example.com',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                example: 'https://example.com/image1.jpg',
              },
            },
          },
        },
        labels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                example: 'Profile description',
              },
              score: {
                type: 'number',
                example: 0.95,
              },
            },
          },
        },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}