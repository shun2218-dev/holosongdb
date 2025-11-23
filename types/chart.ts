export interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: any
    value: number
    name: string
    color: string
  }>
  label?: string
}

export interface CustomBarProps {
  fill?: string
  [key: string]: any
}

export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
  [key: string]: any
}
