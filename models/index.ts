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
    profile_image: { type: DataTypes.STRING(500), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true, underscored: true }
);

// ==================== SUBSCRIPTION MODEL ====================
interface SubscriptionAttributes {
  id: number;
  user_id: number;
  plan_type: 'free' | 'standard' | 'pro' | 'elite';
  contact_limit: number;
  contacts_used: number;
  expiry_date: Date;
  created_at?: Date;
  updated_at?: Date;
}
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'contacts_used'> {}

export class SubscriptionModel extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare plan_type: 'free' | 'standard' | 'pro' | 'elite';
  declare contact_limit: number;
  declare contacts_used: number;
  declare expiry_date: Date;
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
      type: DataTypes.ENUM('free', 'standard', 'pro', 'elite'),
      allowNull: false,
      defaultValue: 'free',
    },
    contact_limit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    contacts_used: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiry_date: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: 'Subscription', tableName: 'subscriptions', timestamps: true, underscored: true }
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
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, modelName: 'ProfileImage', tableName: 'profile_images', timestamps: true, underscored: true }
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

export async function syncModels(force = false): Promise<void> {
  await Religion.sync({ force });
  await Caste.sync({ force });
  await SubCaste.sync({ force });
  await UserModel.sync({ force });
  await SubscriptionModel.sync({ force });
  await ContactViewModel.sync({ force });
  await InterestModel.sync({ force });
  await ProfileViewModel.sync({ force });
  await MessageModel.sync({ force });
  await ProfileImageModel.sync({ force });
  console.log('✅ All models synced');
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
};
