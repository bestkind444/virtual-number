
const man: number = 9 + 7;
console.log(man);
// interface user{name:string, email:string}
// type ID = string;
// enum Role {admin, user} 
// function wrap<T>(value: T): T { return value; }
// npx tsc
const isValid: boolean = true;
const arr: string[] | number[] = ["name", "email"]
const val: any = "system";
console.log(val);

arr.forEach(i => {
    i.toUpperCase
    console.log(i);
    
});
interface User{
    name:string,
    age:number,
    isAdmin?:boolean
}

const user: User = {
    name:"kingsley",
    age:45,
    isAdmin: true
}

console.log(user);

function remove(name: string):  string {
return `hello ${name}`;

}

const add = remove("kingsley");
console.log(add);



