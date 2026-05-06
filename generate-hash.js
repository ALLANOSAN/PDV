import * as argon2 from 'argon2';

const hashPassword = async (password: string) => {
  const hash = await argon2.hash(password);
  console.log('Hash da senha:', hash);
};

// Exemplo: node generate-hash.js "1234"
const password = process.argv[2] || '1234';
hashPassword(password);
