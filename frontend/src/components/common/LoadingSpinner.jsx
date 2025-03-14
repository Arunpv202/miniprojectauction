import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = "lg" }) => {
  const sizes = {
    sm: { width: '16px', height: '16px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '48px', height: '48px' },
  };

  const sizeStyle = sizes[size] || sizes.lg;

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '50%',
        border: '3px solid transparent',
        borderTop: '3px solid #3498db',
        animation: 'spin 1s linear infinite',
        width: sizeStyle.width,
        height: sizeStyle.height,
      }}
    />
  );
};

// PropTypes validation
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']), // Ensure size is one of the valid values
};

export default LoadingSpinner;
