export type MasterUnit = {
  KOKE: string;
  NAKE: string;
  PIMPINAN: string | null;
  NAMA_KTU: string | null;
  NAMA_ASST: string | null;
  JAB_PIM: string | null;
  JAB_KTU: string | null;
  JAB_ASST: string | null;
  created_at?: string;
};

export type MasterUnitInput = Omit<MasterUnit, 'created_at'>;
