export interface ITodo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
}
export type ITodos = Array<ITodo>;
