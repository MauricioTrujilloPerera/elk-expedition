import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false },
  province: { type: String, required: false },
  profilePic: { type: String, required: false },
  isAdmin: { type: Boolean, default: false },
  enrolledHunts: [{ type: String }],
  enrollmentRequests: [{
    huntId: { type: String, required: true },
    requesterId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' },
  }],
  notifications: [{
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;