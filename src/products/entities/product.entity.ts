import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'products'})
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string

    @Column('int', {
        default: 0
    })
    stock: number

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

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
