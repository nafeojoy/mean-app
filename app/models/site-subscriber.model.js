import mongoose from "mongoose";


let siteSubscriberSchema = mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
    //required: [true, "Email is required"]
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  phone_number: {
    type: String
  }
});



export default mongoose.model("SiteSubscriber", siteSubscriberSchema);
