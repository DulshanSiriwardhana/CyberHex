import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Otp from '../../models/Otp.js';

/**
 * Create a verified user directly in the database (bypasses OTP email flow).
 */
export async function createTestUser(overrides = {}) {
  const email = overrides.email ?? `test-${Date.now()}@cyberhex.test`;
  const username = overrides.username ?? `user_${Date.now()}`;

  await Otp.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      email: email.toLowerCase(),
      code: '000000',
      verified: true,
      expiresAt: new Date(Date.now() + 3600000),
    },
    { upsert: true }
  );

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      username,
      email,
      password: overrides.password ?? 'Password123',
      emailVerified: true,
      role: overrides.role ?? 'user',
    });
    await user.save();
  }

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { user, accessToken, email, password: overrides.password ?? 'Password123' };
}

export function authHeader(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}
