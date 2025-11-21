import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true},
  city: { type: String, required: true},
  salary: { type: Number},
  language:{ type:String},
  isManager: { type: Boolean }
});

const Data = mongoose.model("Emp", userSchema);
export default Data;