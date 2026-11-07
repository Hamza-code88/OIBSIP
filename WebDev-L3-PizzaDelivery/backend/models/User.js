const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true },
)

// Never leak the password hash in JSON responses.
userSchema.methods.toSafeObject = function toSafeObject() {
  return { id: this._id.toString(), name: this.name, email: this.email, createdAt: this.createdAt }
}

module.exports = mongoose.model('User', userSchema)
