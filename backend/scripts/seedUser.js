const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedUser = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const username = "owner";
  const plainPassword = "owner123";

  const existing = await User.findOne({ username });
  if (existing) {
    console.log("User already exists");
  } else {
    await User.create({ username, password: plainPassword });
    console.log(`User "${username}" created successfully`);
  }

  mongoose.disconnect();
};

seedUser();
