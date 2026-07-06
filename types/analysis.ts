export interface Analysis {
  id: string;
  userId: string;
  photoUrl: string;
  symmetryScore: number | null;
  results: Record<string, unknown>;
  createdAt: Date;
  regime?: {
    id: string;
    analysisId: string;
    amSteps: Record<string, unknown>[];
    pmSteps: Record<string, unknown>[];
    createdAt: Date;
  } | null;
}

export interface WardrobeAnalysis {
  id: string;
  userId: string;
  photoUrl: string;
  recommendations: Record<string, unknown>;
  createdAt: Date;
}
