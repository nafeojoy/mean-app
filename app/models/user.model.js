import mongoose from 'mongoose';

import bcrypt from 'bcrypt-nodejs';

let userSchema = mongoose.Schema({

    first_name: {
        type: String,
        required: [true, "First name is required"]
    },

    last_name: {
        type: String,
        // required: [true, "Last name is required"]
    },

    address: {
        type: String
    },

    mobile_number: {
        type: String
    },

    local: {

        username: {
            type: String,
            unique: true,
            required: [true, "User name required"]
        },

        password: { //$2a$08$snf96Ru2IRFYHkYm/Yuu6uQDzsKrexybi2TpkSSxPBe0mX5VEEyVO
            type: String,
            required: [true, "Password is required"]
        },

        email: {
            type: String,
        }
    },

    role: {
        type: mongoose.Schema.ObjectId,
        ref: 'Role'
    },

    is_enabled: Boolean

});


userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

export default mongoose.model('User', userSchema);