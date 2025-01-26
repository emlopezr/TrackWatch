import { useMemo } from 'react';
import './Tag.css'

interface TagProps {
  text: string;
}

const Tag = ({ text }: TagProps) => {
  const randomColor = useMemo(() => Math.floor(Math.random()* 360), []);
  const hslColor = `hsl(${randomColor}, 80%, 35%)`;

  return (
    <div
      className='tag'
      style={{ backgroundColor: hslColor }}
    >
      {text}
    </div>
  )
}

export default Tag