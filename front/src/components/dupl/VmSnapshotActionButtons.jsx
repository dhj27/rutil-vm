import React, { useMemo } from 'react'
import useUIState from '../../hooks/useUIState';
import useGlobal from '../../hooks/useGlobal';
import ActionButtonGroup from '../button/ActionButtonGroup';
import Localization from '../../utils/Localization';
import Logger from '../../utils/Logger';


/**
 * @name VmSnapshotActionButtons
 * @description 가상머신 스냅샷 관련 액션버튼
 * 
 * @returns {JSX.Element} VmSnapshotActionButtons
 * 
 * @see VmSnapshotModals
 */
const VmSnapshotActionButtons = ({
  actionType="default",
  hasLocked=false,
  inPreview=false,
}) => {
  const { setActiveModal } = useUIState()
  const { vmsSelected, snapshotsSelected } = useGlobal()
  const isContextMenu = useMemo(() => actionType === "context", [actionType])

  const vmSelected1st = [...vmsSelected][0] ?? null
  const isVmUp = useMemo(() => vmSelected1st?.status === "UP", [vmsSelected])
  const isVmPause = useMemo(() => vmSelected1st?.status === "SUSPENDED", [vmsSelected])
  const snapshotSelected1st =  [...snapshotsSelected][0] ?? null

  const basicActions = useMemo(() => ([
    { type: "create",   onBtnClick: () => setActiveModal("vmsnapshot:create"),  label: Localization.kr.CREATE,  disabled: hasLocked || (isContextMenu && snapshotsSelected.length > 0 ), },
    { type: "preview",  onBtnClick: () => setActiveModal("vmsnapshot:preview"), label: Localization.kr.PREVIEW, disabled: isVmUp || isVmPause || hasLocked || inPreview || snapshotsSelected.length === 0, },
    { type: "commit",   onBtnClick: () => setActiveModal("vmsnapshot:commit"),  label: Localization.kr.COMMIT,  disabled: isVmUp || isVmPause || hasLocked || !inPreview || snapshotsSelected.length === 0, },
    { type: "undo",     onBtnClick: () => setActiveModal("vmsnapshot:undo"),    label: Localization.kr.UNDO,    disabled: isVmUp || isVmPause || hasLocked || !inPreview || snapshotsSelected.length === 0, },
    { type: "remove",   onBtnClick: () => setActiveModal("vmsnapshot:remove"),  label: Localization.kr.REMOVE,  disabled: isVmUp || isVmPause || hasLocked || inPreview || vmsSelected.length === 0 || snapshotsSelected.length === 0, },
  ]), [hasLocked, snapshotsSelected, vmsSelected]);

  Logger.debug(`VmSnapshotActionButtons ... vmsSelected.length: ${vmsSelected.length}, isContextMenu: ${isContextMenu} `)
  return (
    <ActionButtonGroup actionType={actionType} actions={basicActions} />
  );
};

export default VmSnapshotActionButtons