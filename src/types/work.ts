export type WorkImage = {
  src: string;
  caption?: string;
};

export type Work = {
  id: string;
  title: string;
  titleEn?: string;
  year: string;
  medium?: string;
  mediumEn?: string;
  description?: string;
  descriptionEn?: string;
  url?: string;
  images: WorkImage[];
  order: number;
  createdAt: string;
  updatedAt: string;
};
