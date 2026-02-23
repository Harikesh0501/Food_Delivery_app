/**
 * Run: npx ts-node scripts/create-test-user.ts
 * Requires MONGODB_URI in .env
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["user", "restaurant_owner", "admin"], default: "user" },
  addressLine1: { type: String },
  city: { type: String },
  country: { type: String },
  image: { type: String },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

const testUsers = [
  { email: "test@user.com", password: "12345678", name: "Test User", role: "user" },
  { email: "test@owner.com", password: "12345678", name: "Test Owner", role: "restaurant_owner" },
  { email: "test@admin.com", password: "12345678", name: "Test Admin", role: "admin" },
];

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("Set MONGODB_URI or MONGODB_CONNECTION_STRING in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);

  for (const testUser of testUsers) {
    const existing = await User.findOne({ email: testUser.email });
    if (existing) {
      // Update role if it changed
      await User.findByIdAndUpdate(existing._id, { role: testUser.role });
      console.log(`Test user already exists (role updated): ${testUser.email} [${testUser.role}]`);
    } else {
      const user = new User(testUser);
      await user.save();
      console.log(`Created test user: ${testUser.email} / 12345678 [${testUser.role}]`);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
