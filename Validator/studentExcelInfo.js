const loginModel = require("../Models/LoginModel");
const studentModel = require("../Models/StudentModel");

const Validator = {
    listOfStudent : async (students) => {
        let emails = [];
        let mobiles = [];
        let errors = [];
      
        console.log(Array.isArray(students));
      
        students.forEach((element) => {
          emails.push(element.email);
          mobiles.push(element.mobile);
        });
      
        console.log(emails);
        console.log(mobiles);
      
        const validationPromises = students.map(async (element, index) => {
          let msg = "";
          const {
            email,
            password,
            name,
            mobile,
            department,
            parent_name,
            parent_mobile,
            guardian_name,
            guardian_mobile,
            home_addr,
          } = element;
      
          if (!email || !password || !name || !mobile || !parent_name || !parent_mobile || !department) {
            msg = `Email Id, Password, Name, Mobile, Parent Name, Parent Mobile, and Department are required fields`;
            errors.push(msg);
          }
      
          const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z.]{2,}$/;
          const mobileRegex = /^[6-9]\d{9}$/;
      
          if (!emailRegex.test(email)) {
            msg = `Invalid email id at row ${index + 1}`;
            errors.push(msg);
          }
      
          if (!mobileRegex.test(mobile)) {
            msg = `Invalid mobile number ${mobile} at row ${index + 1}`;
            errors.push(msg);
          }
      
          if (!mobileRegex.test(parent_mobile)) {
            msg = `Invalid parent mobile number ${parent_mobile} at row ${index + 1}`;
            errors.push(msg);
          }
      
          if (!mobileRegex.test(guardian_mobile) && guardian_mobile) {
            msg = `Invalid guardian mobile number ${guardian_mobile} at row ${index + 1}`;
            errors.push(msg);
          }
      
          const duplicateEmailCount = emails.filter((ele) => ele === email).length;
          const duplicateMobileCount = mobiles.filter((ele) => ele === mobile).length;
      
          if (duplicateEmailCount > 1 || duplicateMobileCount > 1) {
            msg = "Email id or Mobile number already exists in Excel";
            errors.push(msg);
          }
      
          const loginInfo = await loginModel.findOne({ email });
          const studentInfo = await studentModel.findOne({ mobile });
      
          if (loginInfo) {
            msg = `Email Id - ${email} already exists - row ${index + 1}`;
            errors.push(msg);
          }
      
          if (studentInfo) {
            msg = `Student mobile - ${mobile} already exists - row ${index + 1}`;
            errors.push(msg);
          }
        });
      
        await Promise.all(validationPromises);
        return errors;
      }
}

module.exports = Validator