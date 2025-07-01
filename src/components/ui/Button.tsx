import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-button font-medium transition-all duration-fast touch-target no-tap-highlight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'bg-primary-500 text-white shadow-button hover:bg-primary-600 active:bg-primary-700 active:shadow-button-pressed',
      secondary: 'bg-white text-primary-600 border-2 border-primary-200 hover:bg-primary-50 active:bg-primary-100',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
    }
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }
    
    return (
      <button
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="loading-spinner w-4 h-4 mr-2" />
            Cargando...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 