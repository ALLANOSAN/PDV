import { hash } from 'argon2';

const password = process.argv[2] || '1234';
const hashed = await hash(password);
console.log('Hash da senha:', hashed);
