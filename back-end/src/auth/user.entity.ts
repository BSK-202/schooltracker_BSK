export class User {
    //id: number;
    phone: string;
    password: string;
    role:string;
    constructor( phone: string, password: string,role:string) {
    //this.id = id;
    this.phone = phone;
    this.password=password;
    this.role=role
    }
}