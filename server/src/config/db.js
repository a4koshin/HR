import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("ERROR OCCURED IN THE DATABASE CONNECTION ===>", error);
  }
};
