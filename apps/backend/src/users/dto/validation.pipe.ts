import {
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const firstError = errors[0];
      const constraints = firstError.constraints;
      const errorMessage = constraints ? Object.values(constraints)[0] : 'Validation failed';

      if (firstError.property === 'email') {
        throw new HttpException({
          message: errorMessage,
          property: 'email'
        }, HttpStatus.UNPROCESSABLE_ENTITY);
      } else if (firstError.property === 'password') {
        throw new HttpException({
          message: errorMessage,
          property: 'password'
        }, 423);
      }

      throw new BadRequestException(errorMessage);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}