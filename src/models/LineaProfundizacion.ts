import mongoose, { Document, Schema } from 'mongoose';

export interface ILineaProfundizacion extends Document {
  nombre: string;
  descripcion: string;
  coordinador: string;
  emailCoordinador: string;
  areaConocimiento: string;
  creditosRequeridos: number;
  materias: string[];
  estado: 'activa' | 'inactiva';
  fechaCreacion: Date;
}

const lineaProfundizacionSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  coordinador: {
    type: String,
    required: true
  },
  emailCoordinador: {
    type: String,
    required: true
  },
  areaConocimiento: {
    type: String,
    required: true,
    enum: ['Software', 'Hardware', 'Redes', 'IA', 'Ciberseguridad', 'Datos']
  },
  creditosRequeridos: {
    type: Number,
    required: true,
    min: 0
  },
  materias: [{
    type: String
  }],
  estado: {
    type: String,
    enum: ['activa', 'inactiva'],
    default: 'activa'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<ILineaProfundizacion>('LineaProfundizacion', lineaProfundizacionSchema);