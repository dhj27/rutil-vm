import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rvi16ChevronUp, rvi16ChevronDown } from "../icons/RutilVmIcons";
import ActionButton from "../button/ActionButton";
import ActionButtonGroup from "../button/ActionButtonGroup";
import { openNewTab } from "../../navigation";
import Localization from "../../utils/Localization";

const VmActionButtons = ({
  vmId="",
  openModal,
  isEditDisabled,
  isDeleteDisabled,
  status,
  actionType = 'default',
  isContextMenu 
}) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // 관리버튼 이벤트
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () =>
    setActiveDropdown((prev) => (prev ? null : "manage"));

  const isUp = status === "UP";
  const isDown = status === "DOWN";
  const isMaintenance = status === "MAINTENANCE";
  const isPause = status === "PAUSE";
  const isPoweringDown = status === "POWERING_DOWN";
  const isTemplate = status === "SUSPENDED" || status === "UP";
  const basicActions = [
    { 
      type: "create", label: Localization.kr.CREATE, disabled: false
      , onBtnClick: () => openModal("create")
    }, {
      type: "edit", label: Localization.kr.UPDATE, disabled: isEditDisabled
      , onBtnClick: () => openModal("edit") 
    }, { 
      type: "start", label: Localization.kr.START, disabled: isDeleteDisabled || (isUp && !isMaintenance)
      , onBtnClick: () => openModal("start")
    }, {
      type: "pause", label: "일시중지", disabled: !isUp || isDeleteDisabled
      , onBtnClick: () => openModal("pause") },
    { 
      type: "reboot", label: "재부팅", disabled: !isUp || isDeleteDisabled
      , onBtnClick: () => openModal("reboot") 
    }, { 
      type: "reset", label: "재설정", disabled: !isUp
      , onBtnClick: () => openModal("reset")
    }, { 
      type: "shutdown", label: "종료", disabled: !isUp
      , onBtnClick: () => openModal("shutdown") 
    }, {
      type: "powerOff", label: "전원끔", disabled: !(isUp || isPoweringDown)
      , onBtnClick: () => openModal("powerOff")
    }, { 
      type: "console", label: "콘솔", disabled: !isUp 
      , onBtnClick: () => openNewTab("console", vmId)
    }, {
      type: "snapshot", label: "스냅샷 생성",   disabled: isEditDisabled 
      , onBtnClick: () => openModal("snapshot") 
    }, {
      type: "migration", label: "마이그레이션", disabled: !isUp
      , onBtnClick: () => openModal("migration")
    },
  ];

  const manageActions = [
    // { type: "import", label: Localization.kr.IMPORT, },
    { type: "copyVm", label: `${Localization.kr.VM} 복제`, disabled: isEditDisabled || !isPause },
    { type: "delete", label: Localization.kr.REMOVE, disabled: isDeleteDisabled || !isDown },
    { type: "templates", label: "템플릿 생성", disabled: isUp || isEditDisabled || isTemplate },
    { type: "ova", label: "ova로 내보내기", disabled: isEditDisabled ||  !isDown  },
  ];

  return (
    <ActionButtonGroup
      actionType={actionType}
      actions={basicActions}
    >
    {isContextMenu ? (
      // ✅ context menu일 때도 manageActions 보여주기
      manageActions.map(({ type, label, disabled }) => (
        <button key={type}
          disabled={disabled}
          className="btn-right-click dropdown-item"
          onClick={() => openModal(type)}
        >
          {label}
        </button>
      ))
    ) : (
    <>
      <ActionButton
        actionType={actionType}
        label={"템플릿"}
        onClick={() => navigate("/computing/templates")}
      />
      <div ref={dropdownRef} className="dropdown-container">
        <ActionButton
          iconDef={activeDropdown ? rvi16ChevronUp : rvi16ChevronDown}
          label={Localization.kr.MANAGEMENT}
          onClick={toggleDropdown}
        />
        {activeDropdown && (
          <div className="right-click-menu-box context-menu-item dropdown-menu">
            {manageActions.map(({ type, label, disabled }) => (
              <button key={type}
                disabled={disabled}
                className="btn-right-click dropdown-item"
                onClick={() => openModal(type)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
)}

    </ActionButtonGroup>
  );
};

export default VmActionButtons;
