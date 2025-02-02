const TryCAtch = require("../utils/TryCatch");
const Status = require("../constant");
const WardenModel = require("../Models/WardenModels");
const mongoose = require("mongoose");
const LoginModel = require("../Models/LoginModel");

//@descr create Warden login with profile info
//@route POST /createAccount
//@access private

const createAccount = TryCAtch(async (req, res) => {
  const { email, password, name, profile, primary_number, secondary_number } =
    req.body;
  // console.log( {email, username, password, is_active, user_type} )
  obj = { name, profile, primary_number, secondary_number };
  const wardent_info = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      if (value != undefined) return key;
    })
  );

  const loginInfo = new LoginModel({ email, password, user_type: "warden" });
  try {
    let result = await loginInfo.save();

    login = result._id;

    console.log(wardent_info);
    const wardenResult = await WardenModel({ ...wardent_info, login });
    try {
      await wardenResult.save();
    } catch (err) {
      await LoginModel.deleteOne({ _id: login });
      res.status(Status.NOT_FOUND);
      throw err;
    }

    console.log("result: ", wardenResult);
    // return res.status(Status.SUCCESS).json({ "Success": "account created successfully", "message": result })
    return res.Response(Status.SUCCESS, "Warden info added", {
      email: result.email,
      is_active: result.is_active,
      user_type: result.user_type,
      login_id: result._id,
      ...wardenResult._doc,
    });
  } catch (err) {
    res.status(Status.NOT_FOUND);
    throw err;
  }
});

//@descr create Warden
//@route POST /create
//@access public

const addWarden = TryCAtch(async (req, res) => {
  const { name, profile, login, primary_number, secondary_number } = req.body;
  obj = { name, profile, login, primary_number, secondary_number };
  const wardent_info = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      if (value != undefined) return key;
    })
  );

  try {
    if (login && !mongoose.Types.ObjectId.isValid(login)) {
      throw new Error("Invalid Login Id");
    }
    console.log(wardent_info);
    const result = await WardenModel(wardent_info);
    await result.save();
    return res.Response(Status.SUCCESS, "Warden info added", result);
  } catch (error) {
    res.status(Status.VALIDATION_ERROR);
    throw error;
  }
});

//@descr to get all Warden info
//@route GET /readall
//@access public

const getAllWarden = TryCAtch(async (req, res) => {
  const result = await WardenModel.find();
  if (result.length == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }
  res.Response(Status.SUCCESS, "Retrived Warden info Successfully", result);
});

//@descr to get Warden by session id
//@route GET /read
//@access public

const getWarden = TryCAtch(async (req, res) => {
  // console.log(req.session)
  const login = req.session?.loginId;
  console.log(login);
  if (!login) {
    res.status(Status.NOT_FOUND);
    throw new Error("Session id not found");
  }
  const result = await WardenModel.findOne({ login });
  if (!result) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }
  return res.Response(
    Status.SUCCESS,
    "Retrived Warden info Successfully",
    result
  );
});

//@descr to get Warden by session id
//@route GET /read/login/<id>
//@access public

const getWardenByLoginId = TryCAtch(async (req, res) => {
  // console.log(req.session)
  const { loginId } = req.params;
  console.log(loginId);
  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    res.status(Status.VALIDATION_ERROR);
    throw new Error("Invalid login id");
  }
  const result = await WardenModel.findOne({ login: loginId });
  if (!result) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }
  return res.Response(
    Status.SUCCESS,
    "Retrived Warden info Successfully",
    result
  );
});

//@descr to get Warden by email id
//@route GET /read/email/<email id>
//@access public

const getWardenByEmail = TryCAtch(async (req, res) => {
  const { email_id } = req.params;
  const result = await WardenModel.find().populate("login");
  filtered = result.filter((doc) => doc.login && doc.login.email === email_id);
  if (filter.length == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }
  return res.Response(
    Status.SUCCESS,
    "Retrived Warden info Successfully",
    filtered
  );
});

//@descr to update Warden by session id
//@route UPDATE /update
//@access public

const updateWarden = TryCAtch(async (req, res) => {
  const { name, profile, login, primary_number, secondary_number } = req.body;
  obj = { name, profile, login, primary_number, secondary_number };
  const wardent_info = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      if (value != undefined) return key;
    })
  );

  const loginId = req.session.loginId;
  console.log(loginId);
  if (!loginId) {
    res.status(Status.NOT_FOUND);
    throw new Error("Session id not found");
  }
  const result = await WardenModel.updateOne(
    { login: loginId },
    { $set: wardent_info }
  );

  if (result.modifiedCount == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }

  console.log(result);
  return res.Response(Status.SUCCESS, "Data updated");
});

//@descr to update Warden by login id
//@route UPDATE /update/login/<id>
//@access public

const updateWardenByLoginId = TryCAtch(async (req, res) => {
  const { name, profile, login, primary_number, secondary_number } = req.body;
  obj = { name, profile, login, primary_number, secondary_number };
  const wardent_info = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      if (value != undefined) return key;
    })
  );

  const { loginId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    res.status(Status.VALIDATION_ERROR);
    throw new Error("Invalid login id");
  }
  const result = await WardenModel.updateOne(
    { login: loginId },
    { $set: wardent_info },
    { runValidators: true }
  );
  if (result.modifiedCount == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }
  console.log(result);
  return res.Response(Status.SUCCESS, "Data updated");
});

//@descr to UPDATE Warden by email id
//@route UPDATE /update/email/<email-id>
//@access public

const updateWardenByEmail = TryCAtch(async (req, res) => {
  const { name, profile, login, primary_number, secondary_number } = req.body;
  obj = { name, profile, login, primary_number, secondary_number };
  const wardent_info = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      if (value != undefined) return key;
    })
  );

  const { email } = req.params;
  const result = await WardenModel.find().populate("login");

  const filtered = result.filter(
    (doc) => doc.login && doc.login.email === email
  );
  if (filtered.length == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user found");
  }
  await WardenModel.updateOne(
    { _id: filtered._id },
    { $set: { wardent_info } }
  );
  return res.Response(Status.SUCCESS, "Data Updated");
});

//@descr to DELETE Warden by session id
//@route DELETE /delete
//@access public

const deleteWarden = TryCAtch(async (req, res) => {
  const { loginId } = req.session.loginId;
  if (!loginId) {
    res.status(Status.NOT_FOUND);
    throw new Error("Session id not found");
  }

  const result = await WardenModel.deleteOne({ login: loginId });
  if (result.length == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user Found");
  }
  return res.Response(Status.SUCCESS, "Data Deleted");
});

//@descr to DELETE Warden by login id
//@route DELETE /delete/login/<id>
//@access public

const deleteWardenByLoginId = TryCAtch(async (req, res) => {

  const { loginId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    res.status(Status.VALIDATION_ERROR);
    throw new Error("Invalid login id");
  }

  const result = await WardenModel.deleteOne({ login: loginId });
  await LoginModel.deleteOne({ _id: loginId})
  // console.log(result)
  // console.log(result.deletedCount == 0)
  if (result.deletedCount == 0) {
    res.status(Status.NOT_FOUND);
    throw new Error("No user Found");
  }
  return res.Response(Status.SUCCESS, "Data Deleted");
});

module.exports = {
  createAccount,
  addWarden,
  getAllWarden,
  getWarden,
  getWardenByLoginId,
  updateWarden,
  updateWardenByLoginId,
  deleteWardenByLoginId,
};
