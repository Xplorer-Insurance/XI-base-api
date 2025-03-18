// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { ProfileAI } from './entities/profile-ai.entity';
import { Image } from './entities/image.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'postgres')
    private usersRepository: Repository<User>,
    @InjectRepository(ProfileAI, 'postgres')
    private profileAIRepository: Repository<ProfileAI>,
    @InjectRepository(Image, 'postgres')
    private imagesRepository: Repository<Image>,
  ) {}

  async createMultiple(createUserDtos: CreateUserDto[]) {
    const createdUsers = [];

    for (const userDto of createUserDtos) {
      if (!userDto.email) { 
        console.log(`El usuario no tiene email, creando uno nuevo sin verificar duplicados.`);
        const savedUser = await this.create(userDto);
        createdUsers.push(savedUser);
        continue;
      }

      const existingUser = await this.usersRepository.findOne({
        where: { email: userDto.email }, // Usa email como identificador único
        relations: ['profile', 'images'],
      });
  
      if (existingUser) {
        console.log(`Usuario existente encontrado: ${existingUser.email}, actualizando...`);
        console.log(`Datos anteriores: ${JSON.stringify(userDto)}`);
        const updatedUser = await this.update(existingUser.id, userDto);
        createdUsers.push(updatedUser);
      } else {
        console.log(`Creando nuevo usuario: ${userDto.email}`);
        const savedUser = await this.create(userDto);
        createdUsers.push(savedUser);
      }
    }
    
    return createdUsers;
  }

  async create(createUserDto: CreateUserDto) {
    // Crear el usuario
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);

    // Guardar las imágenes asociadas al usuario
    if (createUserDto.extractedData?.images && createUserDto.extractedData.images.length > 0) {
      const imagePromises = createUserDto.extractedData.images.map(async (imageUrl) => {
        const image = this.imagesRepository.create({
          url: imageUrl,
          user,
          metadata: {},
        });
        await this.imagesRepository.save(image);
      });
      await Promise.all(imagePromises);
    }

    // Guardar el perfil AI asociado al usuario
    if (createUserDto.labels && createUserDto.labels.length > 0) {
      const profileAI = this.profileAIRepository.create({
        actividad_detectada: createUserDto.detectedActivity,
        riesgo: createUserDto.riskLevel,
        metadata: createUserDto.labels,
        user,
      });
      await this.profileAIRepository.save(profileAI);
    }

    return user;  // Retornamos el usuario creado
  }

  findAll() {
    return this.usersRepository.find({ relations: ['profile', 'images'] });
  }

  findOne(id: string) {
    return this.usersRepository.findOne({ where: { id }, relations: ['profile', 'images'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['profile', 'images'] });
  
    if (!user) throw new Error('Usuario no encontrado');
  
    // Actualizar los datos básicos del usuario
    const userToUpdate: Partial<User> = {
        id,
        email: updateUserDto.email,
        name: updateUserDto.name,
        lastname: updateUserDto.lastname,
        link: updateUserDto.link,
        riskLevel: updateUserDto.riskLevel,
    }
    await this.usersRepository.update(id, userToUpdate);
  
    // Actualizar imágenes
    if (updateUserDto.extractedData?.images && updateUserDto.extractedData.images.length > 0) {
      // Eliminar imágenes anteriores y agregar nuevas
      await this.imagesRepository.delete({ user: { id } });
  
      const newImages = updateUserDto.extractedData.images.map((imageUrl) =>
        this.imagesRepository.create({ url: imageUrl, user })
      );
      await this.imagesRepository.save(newImages);
    }
  
    // Actualizar perfil AI
    if (updateUserDto.labels && updateUserDto.labels.length > 0) {
      const profileAI = await this.profileAIRepository.findOne({ where: { user: { id } } });
      if (profileAI) {
        await this.profileAIRepository.update(profileAI.id, {
          actividad_detectada: updateUserDto.detectedActivity,
          riesgo: updateUserDto.riskLevel,
          metadata: updateUserDto.labels,
        });
      } else {
        const newProfileAI = this.profileAIRepository.create({
          actividad_detectada: updateUserDto.detectedActivity,
          riesgo: updateUserDto.riskLevel,
          metadata: updateUserDto.labels,
          user,
        });
        await this.profileAIRepository.save(newProfileAI);
      }
    }
  
    return this.findOne(id);
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}