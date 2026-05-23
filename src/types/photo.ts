export type PhotoImage = { src: string };

export type Photo = {
  id: string;
  images: PhotoImage[];
  caption?: string;
  captionEn?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
