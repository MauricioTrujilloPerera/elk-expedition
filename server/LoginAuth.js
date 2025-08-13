import express from "express";
import User from "./models/user.js";
import bcrypt from "bcrypt";

const router = express.Router();

// POST /register
router.post("/register", async (req, res) => {
  const { username, email, password, phone, province } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required." });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      province,
    });
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    // For now, just return user info (not password)
    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        province: user.province,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /update-profile
router.post("/update-profile", async (req, res) => {
  const { id, username, email, phone, province, profilePic } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, phone, province, profilePic },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        province: updatedUser.province,
        profilePic: updatedUser.profilePic,
        createdAt: updatedUser.createdAt,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /change-password
router.post("/change-password", async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  if (!id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /enroll-hunt (now creates a request, not auto-enroll)
router.post("/enroll-hunt", async (req, res) => {
  const { userId, huntId } = req.body;
  if (!userId || !huntId) {
    return res.status(400).json({ message: "userId and huntId are required." });
  }
  try {
    // Find the hunt to get the host's userId and maxGroupSize
    const Product = (await import("./models/product.js")).default;
    const hunt = await Product.findById(huntId);
    if (!hunt) return res.status(404).json({ message: "Hunt not found" });
    const hostId = hunt.userId;
    // Check if hunt is full
    const enrolledCount = await User.countDocuments({ enrolledHunts: huntId });
    if (hunt.maxGroupSize && enrolledCount >= hunt.maxGroupSize) {
      return res.status(400).json({ message: "Hunt is full. Cannot request enrollment." });
    }
    // Add a pending request to the host's enrollmentRequests
    const host = await User.findById(hostId);
    if (!host) return res.status(404).json({ message: "Host not found" });
    // Prevent duplicate requests
    const alreadyRequested = host.enrollmentRequests.some(r => r.huntId === huntId && r.requesterId === userId && r.status === 'pending');
    if (alreadyRequested) {
      return res.status(400).json({ message: "You have already requested to enroll in this hunt." });
    }
    host.enrollmentRequests.push({ huntId, requesterId: userId, status: 'pending' });
    await host.save();
    res.status(200).json({ message: "Enrollment request sent to host." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /enrollment-requests/:hostId
router.get("/enrollment-requests/:hostId", async (req, res) => {
  try {
    const host = await User.findById(req.params.hostId);
    if (!host) return res.status(404).json({ message: "Host not found" });
    res.json({ requests: host.enrollmentRequests || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /enrollment-requests/:hostId/respond
router.post("/enrollment-requests/:hostId/respond", async (req, res) => {
  const { huntId, requesterId, action } = req.body; // action: 'accept' or 'deny'
  if (!huntId || !requesterId || !['accept', 'deny'].includes(action)) {
    return res.status(400).json({ message: "huntId, requesterId, and valid action are required." });
  }
  try {
    const host = await User.findById(req.params.hostId);
    if (!host) return res.status(404).json({ message: "Host not found" });
    const reqIdx = host.enrollmentRequests.findIndex(r => r.huntId === huntId && r.requesterId === requesterId && r.status === 'pending');
    if (reqIdx === -1) return res.status(404).json({ message: "Request not found or already handled." });
    // If accepting, check if hunt is full
    const Product = (await import("./models/product.js")).default;
    const hunt = await Product.findById(huntId);
    if (!hunt) return res.status(404).json({ message: "Hunt not found" });
    let notificationMsg = '';
    if (action === 'accept') {
      const enrolledCount = await User.countDocuments({ enrolledHunts: huntId });
      if (hunt.maxGroupSize && enrolledCount >= hunt.maxGroupSize) {
        host.enrollmentRequests[reqIdx].status = 'denied';
        await host.save();
        return res.status(400).json({ message: "Hunt is full. Cannot accept request." });
      }
      // Add to enrolledHunts of requester
      const requester = await User.findById(requesterId);
      if (!requester) return res.status(404).json({ message: "Requester not found" });
      if (!requester.enrolledHunts.includes(huntId)) {
        requester.enrolledHunts.push(huntId);
        await requester.save();
      }
      host.enrollmentRequests[reqIdx].status = 'accepted';
      notificationMsg = `Your request to join the ${hunt.hunt_animalType} hunt in ${hunt.hunt_location} on ${hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : ''} was ACCEPTED!`;
      // Add notification to requester
      requester.notifications = requester.notifications || [];
      requester.notifications.push({ message: notificationMsg });
      await requester.save();
    } else {
      host.enrollmentRequests[reqIdx].status = 'denied';
      // Add notification to requester
      const requester = await User.findById(requesterId);
      if (requester) {
        notificationMsg = `Your request to join the ${hunt.hunt_animalType} hunt in ${hunt.hunt_location} on ${hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : ''} was DENIED.`;
        requester.notifications = requester.notifications || [];
        requester.notifications.push({ message: notificationMsg });
        await requester.save();
      }
    }
    await host.save();
    res.json({ message: `Request ${action}ed.` });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /user/:id
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      province: user.province,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
    }});
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// GET /user-search
router.get("/user-search", async (req, res) => {
  const q = req.query.q;
  const currentUserId = req.query.currentUserId;
  if (!q || typeof q !== "string" || !q.trim()) {
    return res.json({ users: [] });
  }
  try {
    const regex = new RegExp(q, "i");
    const query = {
      $or: [
        { username: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    };
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }
    const users = await User.find(query)
      .select("_id username email profilePic")
      .limit(10);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error searching users", error: err.message });
  }
});

// PATCH /user/:id to mark notifications as read
router.patch("/user/:id", async (req, res) => {
  const { markNotificationsRead } = req.body;
  if (!markNotificationsRead) return res.status(400).json({ message: "Nothing to update." });
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.notifications && user.notifications.length > 0) {
      user.notifications.forEach(n => { n.read = true; });
      await user.save();
    }
    res.json({ message: "Notifications marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /enrolled-count/:huntId
router.get("/enrolled-count/:huntId", async (req, res) => {
  const { huntId } = req.params;
  try {
    const count = await User.countDocuments({ enrolledHunts: huntId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// GET /enrolled-users/:huntId
router.get("/enrolled-users/:huntId", async (req, res) => {
  const { huntId } = req.params;
  try {
    const users = await User.find({ enrolledHunts: huntId }).select("_id username email profilePic");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router; 