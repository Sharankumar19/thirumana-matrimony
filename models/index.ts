// models/index.ts — All Sequelize models with associations
import { DataTypes, Model, Optional } from 'sequelize';
// import sequelize from '@/lib/db';
import sequelize from '../lib/db';

// ==================== RELIGION MODEL ====================
interface ReligionAttributes {
  id: number;
  name: string;
}
interface ReligionCreationAttributes extends Optional<ReligionAttributes, 'id'> {}

export class Religion extends Model<ReligionAttributes, ReligionCreationAttributes> {
  declare id: number;
  declare name: string;
}

Religion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  { sequelize, modelName: 'Religion', tableName: 'religions', timestamps: false }
);

// ==================== CASTE MODEL ====================
interface CasteAttributes {
  id: number;
  religion_id: number;
  name: string;
}
interface CasteCreationAttributes extends Optional<CasteAttributes, 'id'> {}

export class Caste extends Model<CasteAttributes, CasteCreationAttributes> {
  declare id: number;
  declare religion_id: number;
  declare name: string;
}

Caste.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    religion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'religions', key: 'id' },
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
  },
  { sequelize, modelName: 'Caste', tableName: 'castes', timestamps: false }
);

// ==================== SUBCASTE MODEL ====================
interface SubCasteAttributes {
  id: number;
  caste_id: number;
  name: string;
}
interface SubCasteCreationAttributes extends Optional<SubCasteAttributes, 'id'> {}

export class SubCaste extends Model<SubCasteAttributes, SubCasteCreationAttributes> {
  declare id: number;
  declare caste_id: number;
  declare name: string;
}

SubCaste.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caste_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'castes', key: 'id' },
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
  },
  { sequelize, modelName: 'SubCaste', tableName: 'subcastes', timestamps: false }
);

// ==================== USER MODEL ====================
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  religion_id: number;
  caste_id: number;
  subcaste_id?: number;
  location: string;
  job?: string;
  salary?: string;
  bio?: string;
  profile_image?: string;
  is_active: boolean;
  
  // Basic Information
  date_of_birth?: Date;
  marital_status?: string;
  mother_tongue?: string;
  community?: string;
  height?: string;
  weight?: string;
  blood_group?: string;
  diet_preference?: string;
  smoking_habit?: string;
  drinking_habit?: string;
  physical_status?: string;
  current_city?: string;
  state?: string;
  country?: string;

  // Family Details
  father_name?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_occupation?: string;
  brothers_count?: number;
  brothers_status?: string;
  sisters_count?: number;
  sisters_status?: string;
  family_type?: string;
  family_values?: string;
  family_financial_status?: string;
  family_native_place?: string;

  // Education & Career
  highest_qualification?: string;
  college_university?: string;
  field_of_study?: string;
  company_name?: string;
  job_designation?: string;
  employment_type?: string;
  annual_income?: string;
  work_location?: string;
  years_of_experience?: number;

  // Hobbies
  hobbies?: string;

  // Partner Preferences
  partner_age_min?: number;
  partner_age_max?: number;
  partner_height_min?: string;
  partner_height_max?: string;
  partner_marital_status?: string;
  partner_religion?: string;
  partner_caste?: string;
  partner_education?: string;
  partner_occupation?: string;
  partner_income?: string;
  partner_location?: string;
  partner_diet?: string;
  partner_smoking?: string;
  partner_drinking?: string;

  // Privacy Settings
  privacy_settings?: string;

  created_at?: Date;
  updated_at?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'phone' | 'subcaste_id' | 'job' | 'salary' | 'bio' | 'profile_image' | 'is_active'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare phone: string | undefined;
  declare age: number;
  declare gender: 'male' | 'female' | 'other';
  declare religion_id: number;
  declare caste_id: number;
  declare subcaste_id: number | undefined;
  declare location: string;
  declare job: string | undefined;
  declare salary: string | undefined;
  declare bio: string | undefined;
  declare profile_image: string | undefined;
  declare is_active: boolean;

  // Basic Information
  declare date_of_birth: Date | undefined;
  declare marital_status: string | undefined;
  declare mother_tongue: string | undefined;
  declare community: string | undefined;
  declare height: string | undefined;
  declare weight: string | undefined;
  declare blood_group: string | undefined;
  declare diet_preference: string | undefined;
  declare smoking_habit: string | undefined;
  declare drinking_habit: string | undefined;
  declare physical_status: string | undefined;
  declare current_city: string | undefined;
  declare state: string | undefined;
  declare country: string | undefined;

  // Family Details
  declare father_name: string | undefined;
  declare father_occupation: string | undefined;
  declare mother_name: string | undefined;
  declare mother_occupation: string | undefined;
  declare brothers_count: number | undefined;
  declare brothers_status: string | undefined;
  declare sisters_count: number | undefined;
  declare sisters_status: string | undefined;
  declare family_type: string | undefined;
  declare family_values: string | undefined;
  declare family_financial_status: string | undefined;
  declare family_native_place: string | undefined;

  // Education & Career
  declare highest_qualification: string | undefined;
  declare college_university: string | undefined;
  declare field_of_study: string | undefined;
  declare company_name: string | undefined;
  declare job_designation: string | undefined;
  declare employment_type: string | undefined;
  declare annual_income: string | undefined;
  declare work_location: string | undefined;
  declare years_of_experience: number | undefined;

  // Hobbies
  declare hobbies: string | undefined;

  // Partner Preferences
  declare partner_age_min: number | undefined;
  declare partner_age_max: number | undefined;
  declare partner_height_min: string | undefined;
  declare partner_height_max: string | undefined;
  declare partner_marital_status: string | undefined;
  declare partner_religion: string | undefined;
  declare partner_caste: string | undefined;
  declare partner_education: string | undefined;
  declare partner_occupation: string | undefined;
  declare partner_income: string | undefined;
  declare partner_location: string | undefined;
  declare partner_diet: string | undefined;
  declare partner_smoking: string | undefined;
  declare partner_drinking: string | undefined;

  // Privacy Settings
  declare privacy_settings: string | undefined;

  declare created_at: Date;
  declare updated_at: Date;
}

UserModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: false },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
    religion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'religions', key: 'id' },
    },
    caste_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'castes', key: 'id' },
    },
    subcaste_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'subcastes', key: 'id' },
    },
    location: { type: DataTypes.STRING(255), allowNull: false },
    job: { type: DataTypes.STRING(150), allowNull: true },
    salary: { type: DataTypes.STRING(50), allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    profile_image: { type: DataTypes.TEXT('long'), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

    // Basic Information
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    marital_status: { type: DataTypes.STRING(50), allowNull: true },
    mother_tongue: { type: DataTypes.STRING(100), allowNull: true },
    community: { type: DataTypes.STRING(100), allowNull: true },
    height: { type: DataTypes.STRING(50), allowNull: true },
    weight: { type: DataTypes.STRING(50), allowNull: true },
    blood_group: { type: DataTypes.STRING(10), allowNull: true },
    diet_preference: { type: DataTypes.STRING(50), allowNull: true },
    smoking_habit: { type: DataTypes.STRING(50), allowNull: true },
    drinking_habit: { type: DataTypes.STRING(50), allowNull: true },
    physical_status: { type: DataTypes.STRING(100), allowNull: true },
    current_city: { type: DataTypes.STRING(100), allowNull: true },
    state: { type: DataTypes.STRING(100), allowNull: true },
    country: { type: DataTypes.STRING(100), allowNull: true },

    // Family Details
    father_name: { type: DataTypes.STRING(150), allowNull: true },
    father_occupation: { type: DataTypes.STRING(150), allowNull: true },
    mother_name: { type: DataTypes.STRING(150), allowNull: true },
    mother_occupation: { type: DataTypes.STRING(150), allowNull: true },
    brothers_count: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
    brothers_status: { type: DataTypes.STRING(255), allowNull: true },
    sisters_count: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
    sisters_status: { type: DataTypes.STRING(255), allowNull: true },
    family_type: { type: DataTypes.STRING(50), allowNull: true },
    family_values: { type: DataTypes.STRING(50), allowNull: true },
    family_financial_status: { type: DataTypes.STRING(100), allowNull: true },
    family_native_place: { type: DataTypes.STRING(150), allowNull: true },

    // Education & Career
    highest_qualification: { type: DataTypes.STRING(150), allowNull: true },
    college_university: { type: DataTypes.STRING(150), allowNull: true },
    field_of_study: { type: DataTypes.STRING(150), allowNull: true },
    company_name: { type: DataTypes.STRING(150), allowNull: true },
    job_designation: { type: DataTypes.STRING(150), allowNull: true },
    employment_type: { type: DataTypes.STRING(100), allowNull: true },
    annual_income: { type: DataTypes.STRING(100), allowNull: true },
    work_location: { type: DataTypes.STRING(150), allowNull: true },
    years_of_experience: { type: DataTypes.INTEGER, allowNull: true },

    // Hobbies
    hobbies: { type: DataTypes.TEXT, allowNull: true },

    // Partner Preferences
    partner_age_min: { type: DataTypes.INTEGER, allowNull: true },
    partner_age_max: { type: DataTypes.INTEGER, allowNull: true },
    partner_height_min: { type: DataTypes.STRING(50), allowNull: true },
    partner_height_max: { type: DataTypes.STRING(50), allowNull: true },
    partner_marital_status: { type: DataTypes.STRING(100), allowNull: true },
    partner_religion: { type: DataTypes.STRING(100), allowNull: true },
    partner_caste: { type: DataTypes.STRING(100), allowNull: true },
    partner_education: { type: DataTypes.STRING(100), allowNull: true },
    partner_occupation: { type: DataTypes.STRING(100), allowNull: true },
    partner_income: { type: DataTypes.STRING(100), allowNull: true },
    partner_location: { type: DataTypes.STRING(100), allowNull: true },
    partner_diet: { type: DataTypes.STRING(100), allowNull: true },
    partner_smoking: { type: DataTypes.STRING(100), allowNull: true },
    partner_drinking: { type: DataTypes.STRING(100), allowNull: true },

    // Privacy Settings
    privacy_settings: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true, underscored: true }
);

// ==================== SUBSCRIPTION MODEL ====================
interface SubscriptionAttributes {
  id: number;
  user_id: number;
  plan_type: 'free' | 'premium' | 'standard' | 'pro' | 'elite';
  contact_limit: number;
  contacts_used: number;
  expiry_date: Date;
  payment_date?: Date;
  transaction_id?: string;
  created_at?: Date;
  updated_at?: Date;
}
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'contacts_used'> {}

export class SubscriptionModel extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare plan_type: 'free' | 'premium' | 'standard' | 'pro' | 'elite';
  declare contact_limit: number;
  declare contacts_used: number;
  declare expiry_date: Date;
  declare payment_date: Date | undefined;
  declare transaction_id: string | undefined;
}

SubscriptionModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    plan_type: {
      type: DataTypes.ENUM('free', 'premium', 'standard', 'pro', 'elite'),
      allowNull: false,
      defaultValue: 'free',
    },
    contact_limit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    contacts_used: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiry_date: { type: DataTypes.DATE, allowNull: false },
    payment_date: { type: DataTypes.DATE, allowNull: true },
    transaction_id: { type: DataTypes.STRING(100), allowNull: true },
  },
  { sequelize, modelName: 'Subscription', tableName: 'subscriptions', timestamps: true, underscored: true }
);

// ==================== PAYMENT MODEL ====================
interface PaymentAttributes {
  id: number;
  user_id: number;
  payment_id: string;
  order_id: string;
  amount: number;
  payment_date: Date;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id'> {}

export class PaymentModel extends Model<PaymentAttributes, PaymentCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare payment_id: string;
  declare order_id: string;
  declare amount: number;
  declare payment_date: Date;
  declare status: string;
  declare created_at: Date;
  declare updated_at: Date;
}

PaymentModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    payment_id: { type: DataTypes.STRING(100), allowNull: false },
    order_id: { type: DataTypes.STRING(100), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_date: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
  },
  { sequelize, modelName: 'Payment', tableName: 'payments', timestamps: true, underscored: true }
);

// ==================== CONTACT VIEW MODEL ====================
interface ContactViewAttributes {
  id: number;
  viewer_id: number;
  viewed_user_id: number;
  created_at?: Date;
}
interface ContactViewCreationAttributes extends Optional<ContactViewAttributes, 'id'> {}

export class ContactViewModel extends Model<ContactViewAttributes, ContactViewCreationAttributes> {
  declare id: number;
  declare viewer_id: number;
  declare viewed_user_id: number;
  declare created_at: Date;
}

ContactViewModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    viewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    viewed_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  { sequelize, modelName: 'ContactView', tableName: 'contact_views', timestamps: true, updatedAt: false, underscored: true }
);

// ==================== INTEREST MODEL ====================
interface InterestAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: Date;
  updated_at?: Date;
}
interface InterestCreationAttributes extends Optional<InterestAttributes, 'id' | 'status'> {}

export class InterestModel extends Model<InterestAttributes, InterestCreationAttributes> {
  declare id: number;
  declare sender_id: number;
  declare receiver_id: number;
  declare status: 'pending' | 'accepted' | 'rejected';
}

InterestModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending',
    },
  },
  { sequelize, modelName: 'Interest', tableName: 'interests', timestamps: true, underscored: true }
);

// ==================== PROFILE VIEW MODEL ====================
interface ProfileViewAttributes {
  id: number;
  viewer_id: number;
  viewed_user_id: number;
  created_at?: Date;
}
interface ProfileViewCreationAttributes extends Optional<ProfileViewAttributes, 'id'> {}

export class ProfileViewModel extends Model<ProfileViewAttributes, ProfileViewCreationAttributes> {
  declare id: number;
  declare viewer_id: number;
  declare viewed_user_id: number;
}

ProfileViewModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    viewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    viewed_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  { sequelize, modelName: 'ProfileView', tableName: 'profile_views', timestamps: true, updatedAt: false, underscored: true }
);

// ==================== MESSAGE MODEL ====================
interface MessageAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at?: Date;
  updated_at?: Date;
}
interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

export class MessageModel extends Model<MessageAttributes, MessageCreationAttributes> {
  declare id: number;
  declare sender_id: number;
  declare receiver_id: number;
  declare content: string;
  declare created_at: Date;
  declare updated_at: Date;
}

MessageModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'Message', tableName: 'messages', timestamps: true, underscored: true }
);

// ==================== PROFILE IMAGE MODEL ====================
interface ProfileImageAttributes {
  id: number;
  user_id: number;
  image_url: string;
  is_primary: boolean;
  created_at?: Date;
  updated_at?: Date;
}
interface ProfileImageCreationAttributes extends Optional<ProfileImageAttributes, 'id'> {}

export class ProfileImageModel extends Model<ProfileImageAttributes, ProfileImageCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare image_url: string;
  declare is_primary: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

ProfileImageModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    image_url: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, modelName: 'ProfileImage', tableName: 'profile_images', timestamps: true, underscored: true }
);

// ==================== NOTIFICATION MODEL ====================
interface NotificationAttributes {
  id: number;
  user_id: number;
  type: 'interest' | 'interest_accepted' | 'message';
  title: string;
  message: string;
  link: string;
  reference_id?: number;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}
interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'is_read'> {}

export class NotificationModel extends Model<NotificationAttributes, NotificationCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare type: 'interest' | 'interest_accepted' | 'message';
  declare title: string;
  declare message: string;
  declare link: string;
  declare reference_id?: number;
  declare is_read: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}


NotificationModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('interest', 'interest_accepted', 'message'),
      allowNull: false,
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    link: { type: DataTypes.STRING(500), allowNull: false },
    reference_id: { type: DataTypes.INTEGER, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Notification', tableName: 'notifications', timestamps: true, underscored: true }
);

// ==================== ASSOCIATIONS ====================
Religion.hasMany(Caste, { foreignKey: 'religion_id', as: 'castes' });
Caste.belongsTo(Religion, { foreignKey: 'religion_id', as: 'religion' });

Caste.hasMany(SubCaste, { foreignKey: 'caste_id', as: 'subcastes' });
SubCaste.belongsTo(Caste, { foreignKey: 'caste_id', as: 'caste' });

UserModel.belongsTo(Religion, { foreignKey: 'religion_id', as: 'religion' });
UserModel.belongsTo(Caste, { foreignKey: 'caste_id', as: 'caste' });
UserModel.belongsTo(SubCaste, { foreignKey: 'subcaste_id', as: 'subcaste' });
UserModel.hasOne(SubscriptionModel, { foreignKey: 'user_id', as: 'subscription' });

SubscriptionModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

ContactViewModel.belongsTo(UserModel, { foreignKey: 'viewer_id', as: 'viewer' });
ContactViewModel.belongsTo(UserModel, { foreignKey: 'viewed_user_id', as: 'viewed_user' });

InterestModel.belongsTo(UserModel, { foreignKey: 'sender_id', as: 'sender' });
InterestModel.belongsTo(UserModel, { foreignKey: 'receiver_id', as: 'receiver' });

ProfileViewModel.belongsTo(UserModel, { foreignKey: 'viewer_id', as: 'viewer' });

MessageModel.belongsTo(UserModel, { foreignKey: 'sender_id', as: 'sender' });
MessageModel.belongsTo(UserModel, { foreignKey: 'receiver_id', as: 'receiver' });

ProfileImageModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
UserModel.hasMany(ProfileImageModel, { foreignKey: 'user_id', as: 'profile_images' });

NotificationModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
UserModel.hasMany(NotificationModel, { foreignKey: 'user_id', as: 'notifications' });

UserModel.hasMany(PaymentModel, { foreignKey: 'user_id', as: 'payments' });
PaymentModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

export async function syncModels(force = false): Promise<void> {
  const alter = true;
  await Religion.sync({ force, alter });
  await Caste.sync({ force, alter });
  await SubCaste.sync({ force, alter });
  await UserModel.sync({ force, alter });
  await SubscriptionModel.sync({ force, alter });
  await ContactViewModel.sync({ force, alter });
  await InterestModel.sync({ force, alter });
  await ProfileViewModel.sync({ force, alter });
  await MessageModel.sync({ force, alter });
  await ProfileImageModel.sync({ force, alter });
  await NotificationModel.sync({ force, alter });
  await PaymentModel.sync({ force, alter });
  console.log('✅ All models synced with alter:true');
}

export default {
  Religion,
  Caste,
  SubCaste,
  UserModel,
  SubscriptionModel,
  ContactViewModel,
  InterestModel,
  ProfileViewModel,
  MessageModel,
  ProfileImageModel,
  NotificationModel,
  PaymentModel,
};
