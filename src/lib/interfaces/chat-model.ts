export interface ChatModel {
  id: string;
  object: 'model';
  ownedBy: string;
  name?: string;
  description?: string;
  created?: number;
}
