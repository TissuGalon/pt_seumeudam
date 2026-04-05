export type MasterRekening = {
  REKSUB: string;
  REKIN: string;
  NAMA_PERK: string;
  created_at?: string;
};

export type MasterRekeningInput = Omit<MasterRekening, 'created_at'>;
