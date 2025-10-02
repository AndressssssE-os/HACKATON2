import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: 'estudiante' | 'admin';
  compararPassword(password: string): Promise<boolean>;
}

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['estudiante', 'admin'],
    default: 'estudiante'
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUsuario>('Usuario', usuarioSchema);