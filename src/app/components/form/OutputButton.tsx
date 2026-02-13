
interface OutputButtonProps {
  label?: string,
  isRequired?: boolean,
  value: string | number,
  onClick?: () => void,
  disabled?: boolean,
  align?: 'left' | 'center' | 'right',
  variant?: 'default' | 'outline' | 'secondary',
  size?: 'sm' | 'md' | 'lg'
}

const OutputButton = ({
                        label,
                        isRequired = false,
                        value,
                        onClick,
                        disabled = false,
                        align = 'left',
                        variant = 'default',
                        size = 'md'
                      }: OutputButtonProps) => {

  const handleClick = () => {
    if (!onClick || disabled) return;
    onClick();
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'secondary':
        return 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200';
      default:
        return 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50';
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-[36px] px-3 text-sm';
      case 'lg':
        return 'h-[52px] px-6 text-lg';
      default:
        return 'h-[44px] px-4';
    }
  }

  return (
    <div className="w-full">
      <div className={!label ? 'hidden' : 'text-[#111928] mb-3'}>
        {label}
        <span className={!isRequired ? 'hidden' : 'text-red-500 ml-1'}>*</span>
      </div>

      <button
        type="button"
        className={`
          w-full rounded-md font-medium transition-colors duration-200
          ${getSizeClasses()}
          ${getVariantClasses()}
          text-${align}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${onClick ? 'hover:shadow-sm' : 'cursor-default'}
        `}
        onClick={handleClick}
        disabled={disabled}
        
      >
        {value || ''}
      </button>
    </div>
  )
}

export default OutputButton;