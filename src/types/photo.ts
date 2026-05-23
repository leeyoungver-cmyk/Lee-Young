export type Photo = {
  id: string;
  src: string;            // main / left image
  srcRight?: string;      // optional right image for paired lightbox view
  caption?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
