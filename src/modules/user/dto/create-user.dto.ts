import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { Gender, Role } from "src/modules/shared/enum"

export class CreateUserDto{
    @IsNotEmpty()
    @IsString()
    fullName: string

    @IsNotEmpty()
    @IsDate()
    dateOfBirth: Date

    @IsNotEmpty()
    @IsEnum(Gender)
    gender:Gender

    @IsNotEmpty()
    @IsPhoneNumber("VN")
    phoneNumber:string

    @IsOptional()
    @IsString()
    email?:string
}