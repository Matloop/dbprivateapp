import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreatePropertyDto {
    @IsString()
    reference : string;
    @IsString()
    @IsOptional()
    oldReference? : string;
    @IsString()
    title: string;
    @IsBoolean()
    showOnSite: boolean;
    @IsBoolean()
    isExclusive;
    @IsArray()
    finality : string[];
    @IsNumber()
    @Min(0, {message: 'não pode ser meno que 0'})
    value: number;
    
}
