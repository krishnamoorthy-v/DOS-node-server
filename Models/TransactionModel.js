const mongoose = require("mongoose")
const { validate } = require("./PasswordResetModel")

transaction_schema = mongoose.Schema({

    reason: { type: String },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Check_In", "Check_Out", "Completed", "Expired"], default: "Pending" },
    out_time: { 
        type: Date, 
        validate: {
            validator: async function(value) {
                if( new Date(value).getTime() < (new Date().getTime() - 1000 * 60 ) ) {
                    throw new Error("Invalid out time - out time must be higher than current time not past time")
                }
            }
        }
    },
    in_time: { 
        type: Date,
        validate: {
            validator: async function(value) {
                if( new Date(value).getTime() <= (new Date(this.out_time).getTime() ) ) {
                    throw new Error("Invalid in time - in time must be higher than out_time")
                }
            }
        }
     },
    actual_in_time: {
         type: Date,
        validate: {
            validator: async function(value) {
                if( new Date(value).getTime() > (new Date(this.actual_out_time).getTime()) ) {
                    throw new Error("Invalid actual_in_time - time must be higher than acutal_out_time")
                } 
            }
        }
        },
    actual_out_time: { 
        type: Date,
        validate: {
            validator: async function(value) {
                if( new Date(value).getTime() < (new Date(this.out_time).getTime())) {
                    throw new Error("Invalid actual out time - time must be higher than out time")
                }
            }
        }
    },
    token_expire: { type: Date },
    qr_code_base_64: { type: String },
    login: {
        type: mongoose.Types.ObjectId,
        ref: "LoginModel",
        required: [true, "login id is required"],
        validate: {
            validator: async function (value) {

                const login = await LoginModel.findById(value)
                if (!login) {
                    throw new Error("Referenced login id not exits")
                }

            }
        }
    }

})

TransactionModel = mongoose.model("TransactionModel", transaction_schema)