export interface SaldoAwal {
  id?: number;
  KOKE: string;
  BULAN: string;
  TAHUN: string;
  REK: string;
  DEBET: number;
  KREDIT: number;
  NAMA_PERK?: string; // Virtual property for UI display
  created_at?: string;
}
