const TransactionModel = require("../Models/TransactionModel");
const TryCAtch = require("../utils/TryCatch");
const Status = require("../constant");
const settings = require("../settings");
const mongoose = require("mongoose");
const generateQRCode = require("../Service/QRService");
const { generateToken, verfiyToken } = require("../utils/jwtHelper");
const StudentModel = require("../Models/StudentModel");

//@descr to create Transaction
//@route POST /create
//@access public

const createTransaction = TryCAtch(async (req, res) => {
  let { reason, out_time, in_time, login } = req.body;
  if(!login) {
    login = req.session.loginId;
  }
  // console.log(mongoose.Types.ObjectId.isValid(login), "  --> ", login)
  if (
    !(mongoose.Types.ObjectId.isValid(login) && /^[0-9a-fA-F]{24}$/.test(login))
  ) {
    // console.log(login)
    res.status(Status.VALIDATION_ERROR);
    throw new Error("Invalid login id");
  }
  const count = await TransactionModel.find({
    login: new mongoose.Types.ObjectId(login),
  }).countDailyPass();
  console.log(count[0]?.count);
  if (count[0]?.count >= settings.outpasslimit) {
    res.status(Status.FORBIDDEN);
    throw new Error("Daily Limit Exits!.");
  }
  // console.log(out_time," ", new Date(out_time)," :  ", in_time," ", new Date(in_time))
  const transaction = new TransactionModel({
    reason,
    out_time,
    in_time,
    login,
  });
  let result = await transaction.save();

  result = result.toObject();
  result.in_time = new Date(result.in_time).toLocaleString();
  result.out_time = new Date(result.out_time).toLocaleString();
  // console.log( new Date(result.in_time).toLocaleString())

  res.Response(Status.SUCCESS, "transaction create", result);
});

//@descr to get all Transaction with help of session id and with some filter option status
//@route GET /stud/read
//@access public

const getOneStudAllTran = TryCAtch(async (req, res) => {
  const login = req.session.loginId;
  const { status } = req.query;

  if (!login) {
    res.status(Status.NOT_FOUND);
    throw new Error("Session id not found");
  }

  let result = await TransactionModel.find({ login });

  if (status) {
    result = result.filter((doc) => doc.status && doc.status == status);
  }

  // console.log(result)

  result = result.map((doc) => {
    doc = doc.toObject();
    doc.in_time = new Date(doc.in_time).toLocaleString();
    doc.out_time = new Date(doc.out_time).toLocaleString();
    doc.actual_in_time = doc.actual_in_time
      ? new Date(doc.actual_in_time).toLocaleString()
      : undefined;
    doc.actual_out_time = doc.actual_out_time
      ? new Date(doc.actual_out_time).toLocaleString()
      : undefined;
    return doc;
  });

  return res.Response(Status.SUCCESS, "Data retrived successfully", result);
});

//@descr to get all Transaction and with some filter option status|login
//@route GET /readall
//@access public

const getALL = TryCAtch(async (req, res) => {
  const { status, login, isToday } = req.query;
  // console.log(status)
  let result = await TransactionModel.find();
  if (login) {
    result = result.filter((doc) => doc.login && doc.login == login);
  }
  if (status) {
    result = result.filter((doc) => doc.status && doc.status == status);
  }
  if (isToday) {
    const today = new Date();
    result = result.filter(
      (doc) =>
        new Date(doc.createdAt).getDate() === today.getDate() &&
        new Date(doc.createdAt).getMonth() === today.getMonth() &&
        new Date(doc.createdAt).getFullYear() === today.getFullYear()
    );
  }

  result = result.map((doc) => {
    doc = doc.toObject();

    doc.in_time = new Date(doc.in_time).toLocaleString();
    doc.out_time = new Date(doc.out_time).toLocaleString();
    doc.actual_in_time = doc.actual_in_time
      ? new Date(doc.actual_in_time).toLocaleString()
      : undefined;
    doc.actual_out_time = doc.actual_out_time
      ? new Date(doc.actual_out_time).toLocaleString()
      : undefined;
    return doc;
  });

  return res.Response(Status.SUCCESS, "Data retrived successfully", result);
});

//@descr to update Transaction
//@route PUT warden/update/<t_id>/<status>
//@access public

const updateStatus = TryCAtch(async (req, res) => {
  const { t_id, status } = req.params;
  if (!["Accepted", "Rejected"].includes(status)) {
    res.status(Status.UNAUTHORIZED);
    throw new Error(
      "warden allowed to update status either Allowed or Rejected"
    );
  }
  if (
    !(mongoose.Types.ObjectId.isValid(t_id) && /^[0-9a-fA-F]{24}$/.test(t_id))
  ) {
    // console.log(t_id)
    res.status(Status.VALIDATION_ERROR);
    throw new Error("Invalid transaction id");
  }

  const result = await TransactionModel.updateOne(
    { _id: t_id, status: { $in: ["Pending"] } },
    { $set: { status } },
    { sort: { date: 1 } }
  );
  if (result.modifiedCount == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("User not found");
  }
  return res.Response(Status.SUCCESS, "Status Update");
});

//@descr to generate qr
//@route GET qrcode/generating/<t_id>
//@access public

const generateQr = TryCAtch(async (req, res) => {
  const { t_id } = req.params;
  const date = new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  if (
    !(mongoose.Types.ObjectId.isValid(t_id) && /^[0-9a-fA-F]{24}$/.test(t_id))
  ) {
    // console.log(t_id)
    res.status(Status.VALIDATION_ERROR);
    throw new Error("Invalid transaction id");
  }

  let result = await TransactionModel.findOne({
    _id: t_id,
    status: { $in: ["Accepted", "Check_Out"] },
  });
  console.log(result);
  if (!result) {
    res.status(Status.NOT_FOUND);
    throw new Error("Transaction with 'Allowed' permission not found");
  }

  result = result.toObject();
  const payload = { _id: result._id, salt: Date.now() };
  let qr;

  console.log(
    result.status == "Accepted",
    " ",
    new Date(result.createdAt).toLocaleString(),
    " ",
    new Date(startOfDay).toLocaleString(),
    " ",
    new Date(endOfDay).toLocaleString(),
    " ",
    !(startOfDay <= result.createdAt || result.createdAt <= endOfDay)
  );
  if (
    result.status == "Accepted" &&
    startOfDay <= result.createdAt &&
    result.createdAt <= endOfDay
  ) {
    payload["status"] = "Accepted";
    const token = generateToken(payload, settings.outpassCheckOutExpireLimit);
    console.log(token);
    qr = await generateQRCode(token);
  } else if (result.status == "Check_Out") {
    payload["status"] = "Check_Out";
    const token = generateToken(payload, settings.outpassCheckInExpireLimit);
    console.log(token);
    qr = await generateQRCode(token);
  } else {
    await TransactionModel.updateOne(
      { _id: t_id },
      { $set: { status: "Expired" } }
    );
    res.status(Status.UNAUTHORIZED);
    throw new Error("Out pass Expired");
  }

  // console.log(qr)
  return res.Response(Status.SUCCESS, `Qr Code generated`, qr);
});

//@descr to verify qr code
//@route POST /qrcode/verify
//@access public

const verifyQr = TryCAtch(async (req, res) => {
  const { token } = req.body;
  try {
    const payload = verfiyToken(token);
    console.log(payload);
    const result = await TransactionModel.findOne({ _id: payload._id });
    let updated_status;
    if (result.status == "Accepted" && payload.status == "Accepted") {
      updated_status = "Check_Out";
      await TransactionModel.updateOne(
        { _id: payload._id },
        { $set: { status: updated_status, actual_out_time: new Date() } }
      );
    } else if (result.status == "Check_Out" && payload.status == "Check_Out") {
      updated_status = "Check_In";
      await TransactionModel.updateOne(
        { _id: payload._id },
        { $set: { status: updated_status, actual_in_time: new Date() } }
      );
    } else {
      res.status(Status.UNAUTHORIZED);
      throw new Error(
        `Last Qr action is - ${result.status} please generate new Qr for further action`
      );
    }
    const student_info = await StudentModel.findOne({
      login: result.login,
    }).populate("login");

    return res.Response(
      Status.SUCCESS,
      `Qr Code Verified and Status updated to - ${updated_status}`,
      student_info
    );
  } catch (error) {
    res.status(Status.UNAUTHORIZED);
    if (error.message === "jwt expired") {
      throw new Error("QR code Expired");
    }
    throw error;
  }
});

module.exports = {
  createTransaction,
  getALL,
  getOneStudAllTran,
  generateQr,
  updateStatus,
  verifyQr,
};
