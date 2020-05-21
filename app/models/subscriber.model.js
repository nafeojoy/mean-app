import mongoose from "mongoose";

// Import library to hash passwords
import bcrypt from "bcrypt-nodejs";
import {
    getDateOfSevenDayLater
} from '../routes/admin/admin-api.service';

var currentDate = new Date();

let subscriberSchema = mongoose.Schema({
    first_name: {
        type: String
    },

    image: {
        "path": { type: String },
        "uploaded_at": { type: Date, default: Date.now }
    },

    import_id: {
        type: Number
    },

    is_verified: {
        type: Boolean,
        default: false
    },
    is_deactive: {
        type: Boolean,
        default: false
    },
    is_close: {
        type: Boolean,
        default: false
    },

    username: {
        type: String
            // unique: true,
            // required: [true, "Username is required"]
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    created_by_admin: {
        type: Boolean,
        default: false
    },
    success_order_info: {
        total_order: {
            type: Number,
            default: 0
        },
        order_value: {
            type: Number,
            default: 0
        }
    },
    email: {
        type: String
            //required: [true, "Email is required"]
    },

    phone_number: {
        type: String
    },

    verification_code: {
        type: Number
    },

    password: { //$2a$08$snf96Ru2IRFYHkYm/Yuu6uQDzsKrexybi2TpkSSxPBe0mX5VEEyVO = //qweqwe
        type: String
            // required: [true, "Password is required"]
    },

    provider: {
        type: String
    },

    facebookId: {
        type: String
    },
    googleId: {
        type: String
    },
    address: {
        type: String
    },
    qrCode: {
        type: String
    },
    profession: {
        type: String
    },
    message: {
        type: String
    },
    review_counter: {
        type: Number
    },
    referral_code: {
        type: String
    },
    wish_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    wallet_transaction_lock: {
        type: Boolean,
        default: false
    },

    cr_balance_status: [{
        order_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Order"
        },
        wallet_trans_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Wallet"
        },
        wallet_amount: {
            type: Number,
            default: 0
        },
        cr_amount: {
            type: Number,
            default: 0
        },
        dr_amount: {
            type: Number,
            default: 0
        },

        is_available: {
            type: Boolean,
            default: false
        },
        is_used: {
            type: Boolean,
            default: false
        },
        created_date: {
            type: Date,
            default: Date.now
        },
        applicable_date: {
            type: Date,
            default: getDateOfSevenDayLater()
        }
    }]
});

subscriberSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

subscriberSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

export default mongoose.model("Subscriber", subscriberSchema);