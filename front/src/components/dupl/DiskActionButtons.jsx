import React from "react";
import useUIState from "../../hooks/useUIState";
import ActionButtonGroup from "../button/ActionButtonGroup";
import Localization from "../../utils/Localization";
import Logger from "../../utils/Logger";
import useGlobal from "../../hooks/useGlobal";

const DiskActionButtons = ({
  actionType = "default",
}) => {
  const { setActiveModal } = useUIState()
  const { disksSelected } = useGlobal()
  const isContextMenu = actionType === "context";

  const selected1st = [...disksSelected][0] ?? null

  // 공유가능일때 이동,복사 버튼 비활성화(sharable)
  const basicActions = [
    { type: "create", onBtnClick: () => setActiveModal("disk:create"), label: Localization.kr.CREATE, disabled: isContextMenu && disksSelected.length > 0, },
    { type: "update", onBtnClick: () => setActiveModal("disk:update"), label: Localization.kr.UPDATE, disabled: disksSelected.length !== 1, },
    { type: "remove", onBtnClick: () => setActiveModal("disk:remove"), label: Localization.kr.REMOVE, disabled: disksSelected.length === 0, },
    { type: "move",   onBtnClick: () => setActiveModal("disk:move"),   label: Localization.kr.MOVE, disabled: disksSelected.length === 0 ||  selected1st?.sharable , },
    { type: "copy",   onBtnClick: () => setActiveModal("disk:copy"),   label: Localization.kr.COPY, disabled: disksSelected.length === 0 ||  selected1st?.sharable  },
    { type: "upload", onBtnClick: () => setActiveModal("disk:upload"), label: "업로드", disabled: isContextMenu && disksSelected.length > 0, },
  ];

  Logger.debug(`DiskActionButtons ... `)
  return (
    <ActionButtonGroup actionType={actionType} actions={basicActions} />
  );
};

export default DiskActionButtons;
