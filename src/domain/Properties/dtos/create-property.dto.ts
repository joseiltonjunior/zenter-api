export type PropertyType = 'HOUSE' | 'APARTMENT' | 'STUDIO' | 'KITNET' | 'ROOM'

export interface CreatePropertyDTO {
  title: string
  type: PropertyType
  address: string
}
