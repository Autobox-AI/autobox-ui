import { useEffect, useState } from 'react'
import { Slider } from './ui/slider'

interface MoodSliderProps {
  labelLeft: string
  labelRight: string
  defaultValue: number
  onChange: (value: number) => void
}

export const MoodSlider: React.FC<MoodSliderProps> = ({
  labelLeft,
  labelRight,
  defaultValue,
  onChange,
}) => {
  const [currentValue, setCurrentValue] = useState(defaultValue)

  useEffect(() => {
    setCurrentValue(defaultValue)
  }, [defaultValue])

  const handleValueChange = (value: number[]) => {
    setCurrentValue(value[0])
    onChange(value[0])
  }

  return (
    <div className="flex items-center space-x-4 mt-4">
      <span className="w-32 text-right">{labelLeft}</span>
      <div className="flex items-center w-full mx-4">
        <Slider
          defaultValue={[defaultValue]}
          max={100}
          step={1}
          // onValueChange={(value) => onChange(value[0])}
          // className="w-[60%]"
          onValueChange={handleValueChange}
          className="w-full mx-4"
        />
        <span className="ml-2 text-sm text-gray-400">{currentValue}%</span>
      </div>
      <span className="w-32 text-left">{labelRight}</span>
    </div>
  )
}
