const mongoose = require("mongoose")
const settings = require("../settings")

transaction_schema = new mongoose.Schema({

    reason: { type: String, required:[true, "reason required"], trim: true},
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Check_In", "Check_Out", "Completed", "Expired"], default: "Pending" },
    out_time: { 
        type: Date, 
        required: [true, "out time required"],
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
        required: [true, "in time required"],
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

}, {
    timestamps: true
})

transaction_schema.query.countDailyPass = async function() {
    // console.log(this.getQuery().login)
    const date = new Date()
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    // console.log(startOfDay, " ", endOfDay)
    return await this.model.aggregate([
        {
            $match: {login: this.getQuery().login, createdAt: {$gte: startOfDay, $lte: endOfDay} }
        },
        {
            $group: {_id: "$login", count: {$count: {}}}
        }
    ])
}


TransactionModel = mongoose.model("TransactionModel", transaction_schema)

module.exports = TransactionModel