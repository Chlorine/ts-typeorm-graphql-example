export type Dictionary<T> = {
  [id: string]: T;
};

export type GenericObject = Dictionary<any>;
