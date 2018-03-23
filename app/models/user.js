var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    username: {
      // type: String,
      // lowercase: true,
      // unique: false,
      // required: [true, "can't be blank"],
      // match: [/^[a-zA-Z0-9]+$/, "is invalid"]
    },
    email: {
      // type: String,
      // lowercase: true,
      // unique: false,
      // required: [true, "can't be blank"],
      // match: [/\S+@\S+\.\S+/, "is invalid"]
    },
    token: {
      // type: String,
      // unique: true,
      // required: [true, "can't be blank"]
    }
  },
  { timestamps: true }
);

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      exp: parseInt(exp.getTime() / 1000),
      email: this.email
    },
    process.env.JWT_SECRET
  );
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

mongoose.model("User", UserSchema);
