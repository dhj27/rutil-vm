import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./LabelInput.css";

/**
 * @name LabelInput
 * @description 레이블 입력란
 *
 * @prop {string} className
 * @prop {string} label
 * @prop {string} id
 * @prop {string} value
 * @prop {boolean} autoFocus
 * @prop {boolean} isEnglishOnly
 * @prop {function} onChange
 * @prop {boolean} disabled
 *
 * @returns {JSX.Element} LabelInput
 */
const LabelInput = ({
  className = "",
  type = "text",
  label,
  id,
  value,
  autoFocus = false,
  isEnglishOnly = false,
  onChange,
  onInvalid,
  required = false,
  ...props
}) => {
  /**
   * @name cNameByType
   * @description {type} 값에 따라 주어지는 class 명 반환
   * 
   * @returns 
   */
  const [showPassword, setShowPassword] = useState(false); // 🔥 비밀번호 보기 상태

  const cNameByType = () => `input-${type}`;

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const isPasswordType = type === "password";
  
  return (
    <div className={`input-container ${cNameByType()} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id}
        type={isPasswordType && showPassword ? "text" : type}
        placeholder={props.placeholder ?? label}
        value={value}
        autoFocus={autoFocus}
        onChange={onChange}
        onInvalid={onInvalid}
        disabled={props.disabled}
        required={required}
        autoComplete={props.autoComplete} // 크롬업데이트안뜨게(확인못해봄)
      />
      {isPasswordType && (
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}
          onClick={handleTogglePassword}
          className="password-toggle-icon fs-14"
        />
      )}
    </div>
  );
};

export default LabelInput;
