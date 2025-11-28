import { IsNumber, IsString, Min } from 'class-validator';

export class CreatePropertyDto {
    @IsString()
    title: string;
    @IsNumber()
    @Min(0, {message: 'não pode ser meno que 0'})
    value: number;
    
}
