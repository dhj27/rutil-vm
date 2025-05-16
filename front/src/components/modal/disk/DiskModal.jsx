import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import useUIState from "../../../hooks/useUIState";
import useGlobal from "../../../hooks/useGlobal";
import BaseModal from "../BaseModal";
import LabelInput from "../../label/LabelInput";
import LabelInputNum from "../../label/LabelInputNum";
import LabelSelectOptionsID from "../../label/LabelSelectOptionsID";
import LabelSelectOptions from "../../label/LabelSelectOptions";
import LabelCheckbox from "../../label/LabelCheckbox";
import {
  useDisk,
  useAddDisk,
  useEditDisk,
  useAllActiveDataCenters,
  useAllActiveDomainsFromDataCenter,
  useAllDiskProfilesFromDomain,
} from "../../../api/RQHook";
import { checkName, convertBytesToGB } from "../../../util";
import { handleInputChange, handleInputCheck, handleSelectIdChange } from "../../label/HandleInput";
import Localization from "../../../utils/Localization";
import Logger from "../../../utils/Logger";

const initialFormState = {
  id: "",
  size: "",
  appendSize: 0,
  alias: "",
  description: "",
  wipeAfterDelete: false,
  sharable: false,
  backup: true,
  sparse: true, //할당정책: 씬
  bootable: false,
  logicalName: "",
  readOnly: false, // vm 읽기전용
  cancelActive: false, // vm 취소 활성화
};

const DiskModal = ({ 
  isOpen, 
  onClose,
  editMode = false, 
}) => {
  // const { closeModal } = useUIState()
  const dLabel = editMode 
    ? Localization.kr.UPDATE
    : Localization.kr.CREATE;

  const { disksSelected } = useGlobal();
  const diskId = useMemo(() => [...disksSelected][0]?.id, [disksSelected]);

  const [formState, setFormState] = useState(initialFormState);
  const [dataCenterVo, setDataCenterVo] = useState({ id: "", name: "" });
  const [domainVo, setDomainVo] = useState({ id: "", name: "" });
  const [diskProfileVo, setDiskProfileVo] = useState({ id: "", name: "" });
  
  const { mutate: addDisk } = useAddDisk(onClose, onClose);
  const { mutate: editDisk } = useEditDisk(onClose, onClose);

  const { data: disk } = useDisk(diskId);
  diskId && Logger.debug(`DiskModal.diskId: ${diskId}`);

  const { 
    data: datacenters = [], 
    isLoading: isDatacentersLoading 
  } = useAllActiveDataCenters((e) => ({ ...e }));
  const { 
    data: domains = [], 
    isLoading: isDomainsLoading 
  } = useAllActiveDomainsFromDataCenter(dataCenterVo?.id || undefined, (e) => ({ ...e }));

  const { 
    data: diskProfiles = [], 
    isLoading: isDiskProfilesLoading 
  } = useAllDiskProfilesFromDomain(domainVo?.id || undefined, (e) => ({ ...e }));


  const [activeTab, setActiveTab] = useState("img");
  const handleTabClick = useCallback((tab) => { setActiveTab(tab) }, []);

  useEffect(() => {
    if (!isOpen) return setFormState(initialFormState);
    if (editMode && disk) {
      setFormState({
        id: disk?.id,
        size: convertBytesToGB(disk?.virtualSize),
        appendSize: 0,
        alias: disk?.alias,
        description: disk?.description,
        wipeAfterDelete: Boolean(disk?.wipeAfterDelete),
        sharable: Boolean(disk?.sharable),
        backup: Boolean(disk?.backup),
        sparse: Boolean(disk?.sparse),
      });
      setDataCenterVo({id: disk?.dataCenterVo?.id, name: disk?.dataCenterVo?.name});
      setDomainVo({id: disk?.storageDomainVo?.id, name: disk?.storageDomainVo?.name});
      setDiskProfileVo({id: disk?.diskProfileVo?.id, name: disk?.diskProfileVo?.name});
    }
  }, [isOpen, editMode, disk]);

  useEffect(() => {
    if (!editMode && datacenters && datacenters.length > 0) {
      setDataCenterVo({id: datacenters[0].id});
    }
  }, [datacenters, editMode]);

  useEffect(() => {
    if (!editMode && domains.length > 0) {
      setDomainVo({id: domains[0].id});
    }
  }, [domains, editMode]);

  useEffect(() => {
    if (!editMode && diskProfiles.length > 0) {
      setDiskProfileVo({id: diskProfiles[0].id});
    }
  }, [diskProfiles, editMode]);

  const handleInputSize = (field) => (e) => {
    const value = e.target.value;
  
    if (field === "size" || field === "appendSize") {
      if (value === "" || /^\d*$/.test(value)) {
        setFormState((prev) => ({ ...prev, [field]: value }));
      } else {
        toast.error("숫자만 입력해주세요.");
      }
    } else {
      setFormState((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    Logger.debug(`DiskModal > validateForm ... `); // 데이터를 확인하기 위한 로그
    const nameError = checkName(formState.alias);
    if (nameError) return nameError;

    if (!formState.size) return "크기를 입력해주세요.";
    if (!dataCenterVo.id) return `${Localization.kr.DATA_CENTER}를 선택해주세요.`;
    if (!domainVo.id) return `${Localization.kr.DOMAIN}을 선택해주세요.`;
    if (!diskProfileVo.id) return `${Localization.kr.DISK_PROFILE}을 선택해주세요.`;
    return null;
  };

  const handleFormSubmit = () => {
    const error = validateForm();
    if (error) return toast.error(error);

    // GB -> Bytes 변환
    const sizeToBytes =  parseInt(formState.size, 10) * 1024 * 1024 * 1024;
    // GB -> Bytes 변환 (기본값 0)
    const appendSizeToBytes = parseInt(formState.appendSize || 0, 10) * 1024 * 1024 * 1024; 

    const dataToSubmit = {
      ...formState,
      size: sizeToBytes,
      appendSize: appendSizeToBytes,
      dataCenterVo,
      storageDomainVo: domainVo,
      diskProfileVo,
    };

    Logger.debug(`DiskModal > handleFormSubmit ... dataToSubmit: `, dataToSubmit); // 데이터를 확인하기 위한 로그
    editMode
      ? editDisk({ diskId: formState.id, diskData: dataToSubmit })
      : addDisk(dataToSubmit);
  };

  return (
    <BaseModal targetName={Localization.kr.DISK} submitTitle={dLabel}
      isOpen={isOpen} onClose={onClose}
      onSubmit={handleFormSubmit}
      contentStyle={{ width: "640px" }}
    >
      <div className="disk-new-nav">
        <div id="storage_img_btn"
          onClick={() => handleTabClick("img")}
          className={activeTab === "img" ? "active" : ""}
        >
          이미지
        </div>
        {/* <div id="storage_directlun_btn" onClick={() => handleTabClick('directlun')} className={activeTab === 'directlun' ? 'active' : ''} >
          직접 LUN
        </div> */}
      </div>

      {/*이미지*/}
      {activeTab === "img" && (
        <div className="disk-new-img">
          <div>
            <LabelInputNum label="크기(GB)"
              value={formState.size}
              autoFocus={true}
              disabled={editMode}
              onChange={handleInputSize("size")}
            />
            {editMode && (
              <LabelInputNum label="추가크기(GB)"
                value={formState.appendSize}
                onChange={handleInputSize("appendSize")}
              />
            )}
            <LabelInput label={Localization.kr.ALIAS}
              value={formState.alias}
              onChange={handleInputChange(setFormState, "alias")}
            />
            <LabelInput label={Localization.kr.DESCRIPTION}
              value={formState.description}
              onChange={handleInputChange(setFormState, "description")}
            />
            <LabelSelectOptionsID label={Localization.kr.DATA_CENTER}
              value={dataCenterVo.id}
              disabled={editMode}
              loading={isDatacentersLoading}
              options={datacenters}
              onChange={handleSelectIdChange(setDataCenterVo, datacenters)}
            />
            <LabelSelectOptionsID label={Localization.kr.DOMAIN}
              value={domainVo.id}
              disabled={editMode}
              loading={isDomainsLoading}
              options={domains}
              onChange={handleSelectIdChange(setDomainVo, domains)}
            />
            <LabelSelectOptions id="sparse" label={Localization.kr.SPARSE}
              value={String(formState.sparse)}
              onChange={(e) => setFormState((prev) => ({...prev, sparse: e.target.value === "true"}))}
              disabled={editMode}
              options={sparseList}
            />
            <LabelSelectOptionsID label={Localization.kr.DISK_PROFILE}
              value={diskProfileVo.id}
              loading={isDiskProfilesLoading}
              options={diskProfiles}
              onChange={handleSelectIdChange(setDiskProfileVo, diskProfiles)}
            />
          </div>
          <div className="disk-new-img-right f-end">
            <div className="img-checkbox-outer">
              <LabelCheckbox label={Localization.kr.WIPE_AFTER_DELETE}
                id="wipeAfterDelete"
                checked={formState.wipeAfterDelete}
                onChange={handleInputCheck(setFormState, "wipeAfterDelete")}
              />
            </div>
            {/* <div className="img-checkbox-outer">
              <LabelCheckbox label={Localization.kr.IS_SHARABLE}
                id="sharable"
                checked={formState.sharable}
                onChange={handleInputChangeCheck("sharable")}
                disabled={editMode}
              />
            </div> */}
            <div className="img-checkbox-outer">
              <LabelCheckbox label="증분 백업 사용"
                id="backup"
                checked={formState.backup}
                onChange={handleInputCheck(setFormState, "backup")}
              />
            </div>
          </div>
        </div>
      )}

      {/* 직접LUN */}
      {/* {activeTab === 'directlun' && (
        <div id="storage-directlun-outer">
          <div id="storage-lun-first">
            <div>
              <div className="img-input-box">
                <span>{Localization.kr.ALIAS}</span>
                <input type="text" />
              </div>
              <div className="img-input-box">
                <span>{Localization.kr.DESCRIPTION}</span>
                <input type="text" />
              </div>
              <div className="img-select-box">
                <label htmlFor="os">{Localization.kr.DATA_CENTER}</label>
                <select id="os">
                  <option value="linux">Linux</option>
                </select>
              </div>
              <div className="img-select-box">
                <label htmlFor="os">{Localization.kr.HOST}</label>
                <select id="os">
                  <option value="linux">Linux</option>
                </select>
              </div>
              <div className="img-select-box">
                <label htmlFor="os">스토리지 타입</label>
                <select id="os">
                  <option value="linux">Linux</option>
                </select>
              </div>
            </div>
            <div className="disk-new-img-right f-end">
              <div>
                <input type="checkbox" className="shareable" />
                <label htmlFor="shareable">{Localization.kr.IS_SHARABLE}</label>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </BaseModal>
  );
};

export default DiskModal;

const sparseList = [
  { value: "true", label: "씬 프로비저닝" },
  { value: "false", label: "사전 할당" },
];