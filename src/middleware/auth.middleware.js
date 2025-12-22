import jwt from "jsonwebtoken";
import { Apierror } from "../utils/Apierror.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { User } from "../models/Employee.models.js";

const verifyjwt = asynchandler(async (req, _, next) => {
  try {
    console.log("Origin:", req.headers.origin);
    console.log("Cookies:", req.cookies);
    console.log("Auth:", req.headers.authorization);

  const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "")


    if (!token) {
      throw new Apierror(401, "Access token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);

    if (!decoded || !decoded._id) {
      throw new Apierror(403, "Invalid token");
    }

    const verifieduser = await User.findById(decoded._id);

    if (!verifieduser) {
      throw new Apierror(404, "User not found");
    }

    req.user = verifieduser;
    next();
  } catch (error) {
    throw new Apierror(500, "Something went wrong in verifying token");
  }
});

export { verifyjwt };
