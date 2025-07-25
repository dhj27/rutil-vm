import { useState, useEffect, useCallback } from "react";
import { useValidationToast }           from "@/hooks/useSimpleToast";
import useGlobal                        from "@/hooks/useGlobal";
import BaseModal                        from "../../BaseModal";
import LabelInput                       from "@/components/label/LabelInput";
import LabelInputNum                    from "@/components/label/LabelInputNum";
import LabelSelectOptionsID             from "@/components/label/LabelSelectOptionsID";
import LabelSelectOptions               from "@/components/label/LabelSelectOptions";
import LabelCheckbox                    from "@/components/label/LabelCheckbox";
import { 
  handleInputChange, 
  handleSelectIdChange
} from "@/components/label/HandleInput";
import {
  useAllActiveDomainsFromDataCenter,
  useAllDiskProfilesFromDomain,
  useAddDiskFromVM,
  useEditDiskFromVM,
  useDiskAttachmentFromVm,
  useVm,
} from "@/api/RQHook";
import { 
  checkKoreanName, 
  checkZeroSizeToGiB, 
  convertBytesToGB, 
} from "@/util";
import Localization                     from "@/utils/Localization";
import Logger                           from "@/utils/Logger";


const initialFormState = {
  id: "",
  size: "",
  appendSize: 0,
  alias: "",
  description: "",
  interface_: "VIRTIO_SCSI", // 인터페이스
  sparse: true, //할당정책: 씬
  active: true, // 디스크 활성화
  wipeAfterDelete: false, // 삭제 후 초기화
  bootable: false, // 부팅가능
  sharable: false, // 공유가능
  readOnly: false, // 읽기전용
  // cancelActive: false, // 취소 활성화
  backup: true, // 증분 백업사용
  shouldUpdateDisk: false,
};

/**
 * @name VmCreateDiskModal
 * @description ...
 * type은 vm이면 가상머신 생성할때 디스크 생성하는 창, disk면 가상머신 디스크 목록에서 생성하는
 * 
 * @param {*} param0 
 * @returns 
 */
const VmCreateDiskModal = ({
  isOpen, onClose,
  editMode = false,
  vmData,
  vmName, // 가상머신 생성 디스크 이름
  dataCenterId,
  hasBootableDisk=false, // 부팅가능한 디스크 여부
  initialDisk,
  onCreateDisk,
}) => {
  const { validationToast } = useValidationToast();
  const { 
    vmsSelected, 
    disksSelected, setDisksSelected 
  } = useGlobal()
  const dLabel = editMode ? Localization.kr.UPDATE : Localization.kr.CREATE;
  const [activeTab, setActiveTab] = useState("img");

  const handleTabClick = useCallback((tab) => { 
    setActiveTab(tab);
  }, []);

  const [formState, setFormState] = useState(initialFormState);
  const [storageDomainVo, setStorageDomainVo] = useState({ id: "", name: "" });
  const [diskProfileVo, setDiskProfileVo] = useState({ id: "", name: "" });

  const { mutate: addDiskVm } = useAddDiskFromVM(onClose, onClose);
  const { mutate: editDiskVm } = useEditDiskFromVM(onClose, onClose);
  const { data: vm } = useVm(vmsSelected[0]?.id);
  
  // 디스크 데이터 가져오기
  const {
    data: diskAttachment
  } = useDiskAttachmentFromVm(vmData?.id, initialDisk?.id);


  // 선택한 데이터센터가 가진 도메인 가져오기
  const {
    data: domains = [], 
    isLoading: isDomainsLoading 
  } = useAllActiveDomainsFromDataCenter(dataCenterId || vm?.dataCenterVo?.id, (e) => ({ ...e }));

  // 선택한 도메인이 가진 디스크 프로파일 가져오기
  const { 
    data: diskProfiles = [], 
    isLoading: isDiskProfilesLoading, 
    isError: isDiskProfilesError,
    isSuccess: isDiskProfilesSuccess
  } = useAllDiskProfilesFromDomain(storageDomainVo.id, (e) => ({ ...e }));

  useEffect(() => {
    if (!editMode && isOpen && vmName) {
      setFormState((prev) => ({ ...prev,
        alias: vmName || vmData?.name,
        bootable: hasBootableDisk ? false : initialDisk?.bootable || true,
       }));
    }
  }, [editMode, isOpen, vmName]); 
  

  useEffect(() => {
    if (!editMode && domains.length > 0 && !storageDomainVo.id) {
      setStorageDomainVo({ id: domains[0].id, name: domains[0].name });
    }
  }, [domains, editMode, storageDomainVo.id]);
  
  useEffect(() => {
    if (!editMode && diskProfiles && diskProfiles.length > 0) {
      setDiskProfileVo({id: diskProfiles[0].id, name: diskProfiles[0].id});
    }
  }, [diskProfiles, editMode]);

  useEffect(() => {
    if (!editMode && interfaceList.length > 0 && !formState.interface_) {
      setFormState((prev) => ({ ...prev, interface_: interfaceList[0].value }));
    }
  }, [interfaceList, editMode, formState.interface_]);

  useEffect(() => {
    if (!isOpen) {
      setFormState((prev) => ({
        ...initialFormState,
        alias: vmName || "", 
        bootable: hasBootableDisk ? false : initialFormState.bootable
      }));
      setStorageDomainVo({ id: domains[0]?.id, name: domains[0]?.name });
      setDiskProfileVo({ id: diskProfiles[0]?.id, name: diskProfiles[0]?.name });
    } 
    if (editMode && diskAttachment) {
      setFormState({
        id: diskAttachment?.id || "",
        size: convertBytesToGB (diskAttachment?.diskImageVo?.virtualSize),
        appendSize: 0,
        alias: diskAttachment?.diskImageVo?.alias || "",
        description: diskAttachment?.diskImageVo?.description || "",
        interface_: diskAttachment?.interface_ || "VIRTIO_SCSI",
        sparse: diskAttachment?.diskImageVo?.sparse || false,
        active: diskAttachment?.active || false,
        wipeAfterDelete: diskAttachment?.diskImageVo?.wipeAfterDelete || false,
        bootable: diskAttachment?.bootable || false,
        sharable: diskAttachment?.diskImageVo?.sharable || false,
        readOnly: diskAttachment?.readOnly || false,
        // cancelActive: diskAttachment?.cancelActive || false,
        backup: diskAttachment?.diskImageVo?.backup || false,
        // shouldUpdateDisk: true
      });
      setStorageDomainVo({ id: diskAttachment?.diskImageVo?.storageDomainVo?.id || "", name: diskAttachment?.diskImageVo?.storageDomainVo?.name || "" });
      setDiskProfileVo({ id: diskAttachment?.diskImageVo?.diskProfileVo?.id || "", name: diskAttachment?.diskImageVo?.diskProfileVo?.name || "" });
    }
  }, [isOpen, editMode, diskAttachment, hasBootableDisk]);

  useEffect(() => {
    if (!editMode && initialDisk) {
      setFormState({
        id: initialDisk?.id || "",
        size: initialDisk?.size || "",
        appendSize: 0,
        alias: initialDisk?.alias || "",
        description: initialDisk?.description || "",
        interface_: initialDisk?.interface_ || "VIRTIO_SCSI",
        sparse: initialDisk?.sparse || false,
        active: initialDisk?.active || false,
        wipeAfterDelete: initialDisk?.wipeAfterDelete || false,
        bootable: hasBootableDisk ? false : true,
        sharable: initialDisk?.sharable || false,
        readOnly: initialDisk?.readOnly || false,
        backup: initialDisk?.backup || false,
        // shouldUpdateDisk: true
      });
      setStorageDomainVo({ id: initialDisk?.diskImageVo?.storageDomainVo?.id || "", name: initialDisk?.diskImageVo?.storageDomainVo?.name || ""  });
      setDiskProfileVo({ id: initialDisk?.diskImageVo?.diskProfileVo?.id || ""});
    }
  }, [editMode, initialDisk, hasBootableDisk]);

  console.log("$ initialDisk", initialDisk)
  
  const handleInputChangeCheck = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const validateForm = useCallback(() => {
    Logger.debug(`VmDiskModal > validateForm ... `)
    if (!formState.alias) return `${Localization.kr.ALIAS}을 입력해주세요.`;
    if (checkKoreanName(formState.alias)) return `${Localization.kr.ALIAS}을 입력해주세요.`;
    if (!formState.size) return `크기를 입력해주세요.`;
    if (!storageDomainVo.id) return `${Localization.kr.DOMAIN}을 선택해주세요.`;
    if (!diskProfileVo.id) return `${Localization.kr.DISK_PROFILE}을 선택해주세요.`;
    return null;
  }, [formState, storageDomainVo, diskProfileVo]);

  // 가상머신 생성 - 가상머신 디스크 생성
  const handleOkClick = useCallback((e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      validationToast.fail(error);
      return;
    }
    Logger.debug(`VmDiskModal > handleOkClick ... `)
 
    // const sizeToBytes = convertGBToBytes(parseInt(formState.size, 10));

    const selectedDomain = domains.find((dm) => dm.id === storageDomainVo.id);
    const selectedDiskProfile = diskProfiles.find((dp) => dp.id === diskProfileVo.id);
    
    const newDisk = {
      alias: formState.alias,
      size: formState.size,
      interface_: formState.interface_,
      sparse: formState.sparse,
      bootable: formState.bootable,
      readOnly: formState.readOnly,
      storageDomainVo: { id: selectedDomain.id },
      diskProfileVo: { id: selectedDiskProfile.id },
      isCreated: true,
    };
    Logger.debug(`VmDiskModal > handleOkClick ... Form Data: `, newDisk);
    onCreateDisk(newDisk);
    onClose();
  }, [formState, storageDomainVo, diskProfileVo]);


  return (
    <BaseModal targetName={Localization.kr.DISK} submitTitle={dLabel}
      isOpen={isOpen} onClose={onClose}
      onSubmit={handleOkClick}
      contentStyle={{ width: "700px" }} 
    >
      <div className="disk-new-img">
        <div>
          <LabelInputNum label="크기(GB)"
            value={formState.size}
            autoFocus
            disabled={editMode}
            onChange={handleInputChange(setFormState, "size")}
          />
          {editMode && (
            <LabelInputNum label="추가크기(GB)"
              value={formState.appendSize}
              onChange={handleInputChange(setFormState, "appendSize")}
            />
          )}
          <LabelInput id="alias" label={Localization.kr.ALIAS}
            value={formState.alias} 
            onChange={handleInputChange(setFormState, "alias")}
          />
          <LabelInput id="description" label={Localization.kr.DESCRIPTION}
            value={formState.description} 
            onChange={handleInputChange(setFormState, "description")}
          />
          <LabelSelectOptions label="인터페이스"
            value={formState.interface_}
            disabled={editMode}
            options={interfaceList}
            onChange={handleInputChange(setFormState, "interface_")}
          />
          <LabelSelectOptionsID label={Localization.kr.DOMAIN}
            value={storageDomainVo.id}
            disabled={editMode}
            loading={isDomainsLoading}
            options={domains}
            onChange={handleSelectIdChange(setStorageDomainVo, domains)}
          />
          {storageDomainVo && (() => {
            const domainObj = domains.find((d) => d.id === storageDomainVo.id);
            if (!domainObj) return null;
            return (
              <div className="text-xs text-gray-500 f-end">
                사용 가능: {checkZeroSizeToGiB(domainObj.availableSize)}
                {" / "}
                총 용량: {checkZeroSizeToGiB(domainObj.size)}
              </div>
            );
          })()}
          <LabelSelectOptionsID label={Localization.kr.DISK_PROFILE}
            value={diskProfileVo.id}
            loading={isDiskProfilesLoading}
            options={diskProfiles}
            onChange={handleSelectIdChange(setDiskProfileVo, diskProfiles)}
          />
          <LabelSelectOptions id="sparse" label={Localization.kr.SPARSE}
            value={String(formState.sparse)}
            disabled={editMode}
            options={sparseList}
            onChange={(e) => setFormState((prev) => ({...prev, sparse: e.target.value === "true", }))}
          />
        </div>
        <div className="img-checkbox-outer f-end checkbox-outer">
          <LabelCheckbox id="wipeAfterDelete" label={Localization.kr.WIPE_AFTER_DELETE}
            checked={Boolean(formState.wipeAfterDelete)} 
            onChange={handleInputChangeCheck("wipeAfterDelete")}
          />
          <LabelCheckbox id="bootable" label={Localization.kr.IS_BOOTABLE}
            checked={Boolean(formState.bootable)}
            disabled={hasBootableDisk} // 이미 부팅 디스크가 있으면 비활성화
            onChange={handleInputChangeCheck("bootable")}
          />
          <LabelCheckbox id="sharable" label={Localization.kr.IS_SHARABLE}
            checked={Boolean(formState.sharable)} 
            disabled={editMode} 
            onChange={handleInputChangeCheck("sharable")} 
          />
          <LabelCheckbox id="readOnly" label={Localization.kr.IS_READ_ONLY}
            checked={Boolean(formState.readOnly)} 
            disabled={editMode}
            onChange={handleInputChangeCheck("readOnly")} 
          />
          <LabelCheckbox id="backup" label="증분 백업 사용"               
            checked={Boolean(formState.backup)} 
            onChange={handleInputChangeCheck("backup")}
          />
        </div>
        <div className='img-checkbox-outer'></div>
      </div>
    </BaseModal>
  );
};

export default VmCreateDiskModal;

const interfaceList = [
  { value: "VIRTIO_SCSI", label: "VirtIO-SCSI" },
  { value: "VIRTIO", label: "VirtIO" },
  { value: "SATA", label: "SATA" },
];

const sparseList = [
  { value: "true", label: "씬 프로비저닝" },
  { value: "false", label: "사전 할당" },
];