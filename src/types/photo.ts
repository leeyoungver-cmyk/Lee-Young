export type PhotoImage = { src: string };

export type Photo = {
  id: string;
  images: PhotoImage[];   // 1 or more images (no limit)
  caption?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
