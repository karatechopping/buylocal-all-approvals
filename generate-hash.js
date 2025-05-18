import bcrypt from 'bcryptjs';

const password = 'BuyLocalNZ2025!@';  // Your password
const rounds = 10;

// Generate salt and hash
const salt = bcrypt.genSaltSync(rounds);
const hash = bcrypt.hashSync(password, salt);

console.log('\nPassword Hash Generator');
console.log('---------------------');
console.log('Password:', password);
console.log('Rounds:', rounds);
console.log('\nGenerated Hash:');
console.log(hash);
console.log('\nFor .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('---------------------\n');