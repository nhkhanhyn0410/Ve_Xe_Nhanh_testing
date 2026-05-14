require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@quikride.com',
  phone: process.env.ADMIN_PHONE || '0900000000',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  fullName: process.env.ADMIN_FULL_NAME || 'Quan Tri Vien He Thong',
};

const DB_CANDIDATES = [
  'mongodb://127.0.0.1:27017/vexenhanh',
  'mongodb://localhost:27017/vexenhanh',
  'mongodb://127.0.0.1:27017/quikride',
  'mongodb://localhost:27017/quikride',
  process.env.MONGODB_URI,
].filter(Boolean);

const connectDB = async () => {
  let lastError;

  for (const uri of DB_CANDIDATES) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });
      return uri;
    } catch (error) {
      lastError = error;
      await mongoose.disconnect().catch(() => {});
    }
  }

  throw lastError || new Error('Could not connect to MongoDB');
};

const ensureAdmin = async () => {
  const email = DEFAULT_ADMIN.email.toLowerCase();
  const admin = await User.findOne({ role: 'admin' }).select('+password');
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

  if (admin) {
    await User.updateOne(
      { _id: admin._id },
      {
        $set: {
          email,
          phone: DEFAULT_ADMIN.phone,
          password: hashedPassword,
          fullName: DEFAULT_ADMIN.fullName,
          role: 'admin',
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          isBlocked: false,
          updatedAt: new Date(),
        },
        $unset: {
          blockedReason: 1,
          blockedAt: 1,
        },
      },
    );

    return { action: 'updated', admin: await User.findById(admin._id) };
  }

  const createdAdmin = new User({
    email,
    phone: DEFAULT_ADMIN.phone,
    password: DEFAULT_ADMIN.password,
    fullName: DEFAULT_ADMIN.fullName,
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  await createdAdmin.save();

  return { action: 'created', admin: createdAdmin };
};

const main = async () => {
  let exitCode = 0;

  try {
    const connectedUri = await connectDB();
    const { action, admin } = await ensureAdmin();

    console.log(JSON.stringify({
      status: 'success',
      action,
      connectedUri,
      credentials: {
        email: admin.email,
        phone: admin.phone,
        password: DEFAULT_ADMIN.password,
      },
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      message: error.message,
    }, null, 2));
    exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(exitCode);
  }
};

main();
