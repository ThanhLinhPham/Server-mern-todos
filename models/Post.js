const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  status: {
    type: String,
    enum: ["TO LEARN", "LEARNING", "LEARNED"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

// users là tên của collection trong db ứng với model nảy
module.exports = mongoose.model("posts", PostSchema);
