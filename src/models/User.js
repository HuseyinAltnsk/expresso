var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: false,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"]
    },
    email: {
      type: String,
      lowercase: true,
      unique: false,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"]
    },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

mongoose.model("User", UserSchema);
