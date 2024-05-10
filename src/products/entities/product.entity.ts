import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";
import { User } from "../../auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({ 
        format: 'uuid',
        description: 'Product Id',
        uniqueItems: true
    }) // decorador de documentación
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ 
        example: 'T-shirt Teslo',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({ 
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number;

   @ApiProperty({ 
        example: 'Voluptate nulla occaecat mollit cupidatat. Nisi consequat qui incididunt eiusmod id velit fugiat qui dolor. Ipsum sunt commodo non eu ut veniam fugiat dolor sunt consectetur cupidatat eu esse. Exercitation aute Lorem ad nisi ut labore dolore qui. Fugiat et sit est ipsum consectetur aliqua esse laborum dolore proident et.',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({ 
        example: 't-shirt-teslo',
        description: 'Product slug for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty({ 
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number

    @ApiProperty({ 
        example: ["XS","S","M"],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({ 
        example: "men",
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty({ 
        example:["shirt","men"],
        description: 'Product tags',
    })
    @Column('text', {
        array: true
    })
    tags: string[];

    @ApiProperty({ 
        example:["8529312-00-A_0_2000.jpg","8529312-11-A_0_2000.jpg"],
        description: 'Product images',
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager:true } // eager se utiliza para que en las consultas nos muestre los datos relacionados
    )
    images?: ProductImage[]


    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User
   
     //Procediemiento antes de guardar 
    @BeforeInsert() 
    checkSlugInsert(){
        if( !this.slug ) {
            this.slug = this.title;  
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'",'')
    }


    //Procediemiento antes de actualizar 
    @BeforeUpdate() 
    checkSlugUpdate() {       
        if( this.title ) {
            this.slug = this.title;  
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'",'')
    }
    
}
