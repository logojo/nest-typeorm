import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({     
        description: 'Product title',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price: number;

    @ApiProperty({        
        description: 'Product description',
        default: null
    })
    @IsString()
    @IsOptional()
    description?: string;
  
    @ApiProperty({ 
        description: 'Product slug for SEO',
        uniqueItems: true
    })
    @IsString()
    @IsOptional()
    slug: string;

    @ApiProperty({ 
        description: 'Product stock',
        default: 0
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock: number;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    
    @ApiProperty({ 
        description: 'Product gender',
    })
    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @ArrayMinSize(1)
    tags: string[]

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[]
}
