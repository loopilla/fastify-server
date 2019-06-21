import { Document, Schema, Model, model} from 'mongoose';

export interface userDocument extends Document {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    lastLogin: string;
    loginType: string;
    googleToken: string,
    facebookToken: string
    modDate: Date
    // readonly thirdPartiyTokens: TokenInfo[];    // downloads: IDownload[];
}

export interface userModel extends userDocument {}

export const userSchema: Schema = new Schema(
    {
        email: String,
        password: String,
        username: String,
        firstName: String,
        lastName: String,
        role: {
            type: String,
            default: 'user'
        },
        lastLogin: String,
        loginType: {
            type: String,
            default: 'jwt'
        },
        googleToken: String,
        facebookToken: String,
        modDate: Date
    },
    {
        collection: 'users'
    }
);

userSchema.pre<userDocument>('save', async function() {
    this.modDate = new Date();
});

export const user: Model<userModel> = model<userModel>(
    'user',
    userSchema
);
