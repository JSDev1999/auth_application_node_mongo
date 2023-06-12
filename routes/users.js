let express = require("express");
let router = express.Router();
const User = require("../model/user.js");
const Otp = require("../model/otp.js");
const {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  INTERNAL_SERVER,
} = require("../utils/constant.js");
const bcrypt = require("bcrypt");
const saltRounds = process.env.SALT_ROUND;
const _ = require("lodash");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { sendOtpEmail, sendRegisterEmailEmail } = require("../utils/commen.js");
let passwordValidator = require("password-validator");
// Create a schema
const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .not()
  .spaces();

router.post("/signup", async (req, res, next) => {
  try {
    const { body } = req;
    const { name, email, password } = body;
    if (name && email && password) {
      if (!passwordSchema.validate(password))
        return res.status(BAD_REQUEST).json({
          message:
            "password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters",
        });
      let encrypt_password = await bcrypt
        .hash(password, _.toNumber(saltRounds))
        .catch((err) => {
          console.error("issue in password encrypt ", err);
          return null;
        });
      body.password = encrypt_password;
      body.emailverify = false;
      await User.create(body)
        .then((result) => {
          result = result.toObject();
          delete result.password;
          let registerurl = `${process.env.WEBDOMAIL_URL}/users/verify/email?user_id=${result._id}`;
          sendRegisterEmailEmail(email, registerurl, result.name).catch(
            (err) => {
              console.error("issue in send Register Email  ", err);
            }
          );
          return res.status(OK).json(result);
        })
        .catch((err) => {
          return res
            .status(err.status || BAD_REQUEST)
            .json({ message: err.message });
        });
    } else {
      return res.status(BAD_REQUEST).json({ message: "Invalid Details" });
    }
  } catch (error) {
    console.error("issue in signup ", error);
    return res
      .status(error.status || BAD_REQUEST)
      .json({ message: error.message });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { body } = req;
    const { email, password } = body;
    if (email && password) {
      let users = await User.findOne({ email: email }).catch((err) => {
        console.error("issue in user find ", err);
        return null;
      });
      if (users) {
        if (!users.emailverify)
          return res
            .status(BAD_REQUEST)
            .json({ message: "Still Your Account Not Verified" });
        let match = await bcrypt
          .compare(password, users.password)
          .catch((err) => {
            console.error("issue in password decrypt ", err);
            return null;
          });
        if (match) {
          await sendOtp(email, users.name).catch((err) => {
            console.error("issue in send Otp Email ", err);
          });
          return res
            .status(OK)
            .json({ message: "Otp Send Your Email. Please Check It!" });
        } else {
          return res.status(BAD_REQUEST).json({ message: "Wrong Password" });
        }
      } else {
        return res.status(NOT_FOUND).json({ message: "No Data Found" });
      }
    } else {
      return res.status(BAD_REQUEST).json({ message: "Invalid Details" });
    }
  } catch (error) {
    console.error("issue in signup ", error);
    return res
      .status(error.status || BAD_REQUEST)
      .json({ message: error.message });
  }
});

router.post("/verifyotp", async (req, res, next) => {
  try {
    const { body } = req;
    const { email, otp } = body;
    console.log("ppppppppppppppp", email, otp);

    if (email && otp) {
      let users = await Otp.findOne({ email: email, used: false }).catch(
        (err) => {
          console.error("issue in user find ", err);
          // return null;
        }
      );
      if (users) {
        if (users.otp !== otp) {
          return res.status(BAD_REQUEST).json({ message: "Invalid Otp" });
        } else {
          const doc = await Otp.findOneAndUpdate(
            { _id: users._id },
            { $set: { used: true } },
            { upsert: true, returnDocument: "after" }
          );
          const userData = await User.findOne({ email: email });
          return res
            .status(OK)
            .json({ data: userData, message: "Otp Verify Success..." });
        }
      } else {
        return res.status(NOT_FOUND).json({ message: "No Data Found" });
      }
    } else {
      return res.status(BAD_REQUEST).json({ message: "Invalid Details" });
    }
  } catch (error) {
    console.error("issue in verify otp ", error);
    return res
      .status(error.status || BAD_REQUEST)
      .json({ message: error.message });
  }
});

router.get("/verify/email", async (req, res, next) => {
  try {
    const { query } = req;
    const { user_id } = query;
    if (user_id) {
      let users = await User.findOne({ _id: user_id }).catch((err) => {
        console.error("issue in user find ", err);
        return null;
      });
      if (users) {
        if (users.emailverify) {
          return res
            .status(BAD_REQUEST)
            .json({ message: "Already Verified. Please Login..." });
        } else {
          const doc = await User.findOneAndUpdate(
            { _id: users._id },
            { $set: { emailverify: true } },
            { upsert: true, returnDocument: "after" }
          );
          return res.status(OK).json({ message: "Email Verify Success..." });
        }
      } else {
        return res.status(NOT_FOUND).json({ message: "No Data Found" });
      }
    } else {
      return res.status(BAD_REQUEST).json({ message: "Invalid Details" });
    }
  } catch (error) {
    console.error("issue in verify email ", error);
    return res
      .status(error.status || BAD_REQUEST)
      .json({ message: error.message });
  }
});

async function sendOtp(email, name) {
  try {
    if (email) {
      let otp_users = await Otp.findOne({ email: email, used: false }).catch(
        (err) => {
          console.error("issue in otp user find ", err);
          return null;
        }
      );
      if (otp_users) {
        return await sendOtpEmail(otp_users.email, otp_users.otp, name).catch(
          (err) => {
            console.error("issue in sendOtpEmail ", err);
            return null;
          }
        );
      } else {
        let otp = await otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          digits: true,
          lowerCaseAlphabets: false,
        });
        let body = { email: email, used: false, otp: otp };
        await Otp.create(body)
          .then((result) => {
            return sendOtpEmail(email, otp, name).catch((err) => {
              console.error("issue in sendOtpEmail ", err);
              return null;
            });
          })
          .catch((err) => {
            console.error("issue in send Otp ", err);
            throw err;
          });
      }
    }
    return null;
  } catch (error) {
    console.error("issue in send Otp ", error);
    throw error;
  }
}

module.exports = router;
