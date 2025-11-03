import bcrypt from 'bcryptjs';

/**
 * Utility script to generate password hashes for admin users
 * Usage: node generateHash.js [password]
 */

const password = process.argv[2] || 'admin123';

const generateHash = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('\n🔐 Password Hash Generator\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in your SQL INSERT statement:');
    console.log(`INSERT INTO users (email, password_hash) VALUES ('admin@planmorph.com', '${hash}');`);
    console.log('');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
};

generateHash();
