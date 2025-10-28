const Input = ({
  label,
  error,
  className = "",
  multiline = false,
  rows = 1,
  ...props
}) => {
  const inputClasses = `w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 ${
    error ? "border-red-500 focus:ring-red-500" : ""
  }`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`${inputClasses} resize-none`}
          rows={rows}
          {...props}
        />
      ) : (
        <input className={inputClasses} {...props} />
      )}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default Input;
