import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import BaseModal from "../BaseModal";
import LabelSelectOptionsID from "../../label/LabelSelectOptionsID";
import LabelInput from "../../label/LabelInput";
import LabelCheckbox from "../../label/LabelCheckbox";
import LabelInputNum from "../../label/LabelInputNum";
import { checkKoreanName } from "../../../util";
import {
  useAllDataCenters,
  useClustersFromDataCenter,
  useAddNetwork,
  useEditNetwork,
  useNetworkById,
} from "../../../api/RQHook";
import "./MNetwork.css";
import DynamicInputList from "../../label/DynamicInputList";
import Localization from "../../../utils/Localization";

const FormGroup = ({ label, children }) => (
  <div className="network-form-group center">
    <label style={{ "font-size": "15px" }}>{label}</label>
    {children}
  </div>
);

const initialFormState = {
  id: "",
  name: "",
  description: "",
  comment: "",
  mtu: "0",
  vlan: "0",
  usageVm: true,
  portIsolation: false,
};

//  Fault reason is "Operation Failed". Fault detail is "[Cannot edit Network. This logical network is used by host: rutilvm-dev.host04
const NetworkModal = ({
  isOpen,
  editMode = false,
  networkId,
  dcId,
  onClose,
}) => {
  const nLabel = editMode ? "편집" : "생성";
  const [formState, setFormState] = useState(initialFormState);
  const [dataCenterVoId, setDataCenterVoId] = useState("");
  const [clusterVoList, setClusterVoList] = useState([]);
  const [dnsEnabled, setDnsEnabled] = useState(false);

  const { mutate: addNetwork } = useAddNetwork();
  const { mutate: editNetwork } = useEditNetwork();

  const { data: network } = useNetworkById(networkId);
  const { data: datacenters = [], isLoading: isDatacentersLoading } =
    useAllDataCenters((e) => ({ ...e }));
  const { data: clusters = [], isLoading: isNetworksLoading } =
    useClustersFromDataCenter(dataCenterVoId, (e) => ({ ...e }));

  useEffect(() => {
    if (!isOpen) setFormState(initialFormState);
    if (editMode && network) {
      setFormState({
        id: network.id,
        name: network.name,
        description: network.description,
        comment: network.comment,
        mtu: network.mtu,
        vlan: network.vlan,
        usageVm: network.usage?.vm,
        portIsolation: network.portIsolation || false, 
      });
      setDataCenterVoId(network?.datacenterVo?.id);
    }
  }, [isOpen, editMode, network]);

  useEffect(() => {
    if (dcId) {
      setDataCenterVoId(dcId);
    } else if (!editMode && datacenters && datacenters.length > 0) {
      setDataCenterVoId(datacenters[0].id);
    }
  }, [datacenters, dcId, editMode]);

  useEffect(() => {
    if (clusters && clusters.length > 0) {
      setClusterVoList((prev) =>
        clusters.map((cluster, index) => ({
          ...cluster,
          isConnected: prev[index]?.isConnected ?? true,
          isRequired: prev[index]?.isRequired ?? false,
        }))
      );
    }
  }, [clusters]);

  const handleInputChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validateForm = () => {
    if (checkKoreanName(formState.name))
      return "이름이 유효하지 않습니다.";
    if (!formState.name)
      return "이름을 입력해주세요.";
    // if (!checkKoreanName(formState.description))
    //   return "설명이 유효하지 않습니다.";
    if (!dataCenterVoId) 
      return `${Localization.kr.DATA_CENTER}를 선택해주세요.`;
    return null;
  };

  const handleFormSubmit = () => {
    const error = validateForm();
    if (error) return toast.error(error);

    const selectedDataCenter = datacenters.find(
      (dc) => dc.id === dataCenterVoId
    );

    const dataToSubmit = {
      ...formState,
      datacenterVo: {
        id: selectedDataCenter.id,
        name: selectedDataCenter.name,
      },
      clusterVos: clusterVoList
        .filter((cluster) => cluster.isConnected) // 🔥 연결된 클러스터만 필터링
        .map((cluster) => ({
          id: cluster.id,
          name: cluster.name,
          required: cluster.isRequired,
        })),
      mtu: formState.mtu ? parseInt(formState.mtu, 10) : 0, // mtu가 빈 값이면 1500 설/정
      vlan: formState.vlan !== 0 ? parseInt(formState.vlan, 10) : 0, // 빈 문자열을 null로 설정
      portIsolation: formState.portIsolation,
      usage: { vm: formState.usageVm },
    };

    const onSuccess = () => {
      onClose();
      toast.success(`네트워크 ${nLabel} 완료`);
    };
    const onError = (err) => toast.error(`Error ${nLabel} network: ${err}`);

    console.log("Form Data: ", dataToSubmit); // 데이터를 확인하기 위한 로그

    editMode
      ? editNetwork(
          { networkId: formState.id, networkData: dataToSubmit },
          { onSuccess, onError }
        )
      : addNetwork(dataToSubmit, { onSuccess, onError });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}
      targetName={"논리 네트워크"}
      submitTitle={editMode ? "편집" : "생성"}
      onSubmit={handleFormSubmit}
      contentStyle={{ width: "700px"}}
    >
      {/* <div className={`network-new-popup modal ${editMode ? "edit-mode" : ""}`}> */}
      <div className="network-first-contents">
        <LabelSelectOptionsID label={Localization.kr.DATA_CENTER}
          value={dataCenterVoId}
          onChange={(e) => setDataCenterVoId(e.target.value)}
          disabled={editMode}
          loading={isDatacentersLoading}
          options={datacenters}
        />
        <LabelInput
          label="이름"
          id="name"
          value={formState.name}
          onChange={handleInputChange("name")}
          autoFocus
        />
        <LabelInput
          label="설명"
          id="description"
          value={formState.description}
          onChange={handleInputChange("description")}
        />
        <LabelInput
          label="코멘트"
          id="comment"
          value={formState.comment}
          onChange={handleInputChange("comment")}
        />
        <hr />

        <div className=" center">
          <LabelCheckbox
            label="VLAN 태깅 활성화"
            id="vlan"
            checked={formState.vlan !== null} // 기본적으로 체크 해제
            onChange={(e) => {
              const isChecked = e.target.checked;
              setFormState((prev) => ({
                ...prev,
                vlan: isChecked ? "" : null, // 체크하면 빈 문자열, 해제하면 null
              }));
            }}
          />

        
          <LabelInputNum
            id="vlan"
            value={formState.vlan === null ? "" : formState.vlan}
            onChange={(e) => {
              setFormState((prev) => ({
                ...prev,
                vlan: e.target.value, //  입력값 그대로 반영
              }));
            }}
            disabled={formState.vlan === null} // 체크되지 않으면 비활성화
            />
          
        </div>

        <LabelCheckbox
          className="network-checkbox-only"
          label="가상 머신 네트워크"
          id="usageVm"
          checked={formState.usageVm}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setFormState((prev) => ({
              ...prev,
              usageVm: isChecked,
              portIsolation: isChecked ? prev.portIsolation : false, // 포트 분리를 비활성화
            }));
          }}
        />
        <LabelCheckbox
          className="network-checkbox-only"
          label="포트 분리"
          id="portIsolation"
          checked={formState.portIsolation}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              portIsolation: e.target.checked,
            }))
          }
          disabled={editMode || !formState.usageVm} // 가상 머신 네트워크가 비활성화되면 비활성화(??)
        />

        <FormGroup label="MTU" className="mtu-form">
          <div className="mtu-input-outer">
            <div className="mtu-radio-input">
              <div className="flex">
                <input
                  type="radio"
                  checked={formState.mtu === "0"} // 기본값 1500 선택됨
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, mtu: "0" }))
                  }
                />
                <label>기본값 (1500)</label>
              </div>
              <div className="flex">
                <input
                  type="radio"
                  checked={formState.mtu !== "0"} // 사용자 정의 값이 있을 때 선택됨
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, mtu: "" }))
                  } // 빈 문자열로 설정해 사용자가 입력할 수 있도록
                />
                <label>사용자 정의</label>
              </div>
            </div>
            <div className="mtu-text-input">
              <input
                type="number"
                style={{ width: "100%" }}
                min="68"
                step="1"
                disabled={formState.mtu === "0"} // 기본값 선택 시 비활성화
                value={formState.mtu === "0" ? "" : formState.mtu} // 기본값일 경우 빈 값 표시
                onChange={(e) => {
                  const value = e.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    mtu: value, // 입력값 반영
                  }));
                }}
              />
            </div>
          </div>
        </FormGroup>
        <LabelCheckbox
          className="network-checkbox-only"
          label="DNS 설정"
          id="dns_settings"
          checked={dnsEnabled}
          onChange={(e) => setDnsEnabled(e.target.checked)}
        />

        <div className="text-[15px] font-bold">
          DNS 서버
        </div>
      
        {/* <FormGroup>
          <div
            className="network-form-group center"
            style={{ width: "100%", padding: 0 }}
          >
            <input type="text" id="dns_server" disabled={!dnsEnabled} />
            <div
              className="plusbtns"
              style={{ "font-size": "13px", height: "32px" }}
            >
              <button
                type="button"
                className="border-r border-gray-500"
                onClick={() => console.log("Add DNS Server")}
                disabled={!dnsEnabled} // 버튼도 비활성화
              >
                +
              </button>
              <button
                type="button"
                className="border-r border-gray-500"
                onClick={() => console.log("Remove DNS Server")}
                disabled={!dnsEnabled}
              >
                -
              </button>
            </div>
          </div>
        </FormGroup> */}
        <DynamicInputList maxCount={3}  inputType="text"  disabled={!dnsEnabled} />

        {!editMode && (
          <div className="network-new-cluster-form">
            <hr />
            <span>클러스터에서 네트워크를 연결/분리</span>
            <div>
              <table className="network-new-cluster-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>
                      <div className="flex">
                        <input
                          type="checkbox"
                          id="connect_all"
                          checked={clusterVoList.every(
                            (cluster) => cluster.isConnected
                          )} // 모든 클러스터 연결 상태 확인
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setClusterVoList((prevState) =>
                              prevState.map((cluster) => ({
                                ...cluster,
                                isConnected: isChecked,
                                isRequired: isChecked
                                  ? cluster.isRequired
                                  : false, // 연결 해제 시 필수도 해제
                              }))
                            );
                          }}
                        />
                        <label htmlFor="connect_all"> 모두 연결</label>
                      </div>
                    </th>
                    <th>
                      <div className="flex">
                        <input
                          type="checkbox"
                          id="require_all"
                          checked={
                            clusterVoList.every(
                              (cluster) => cluster.isRequired
                            ) &&
                            clusterVoList.every(
                              (cluster) => cluster.isConnected
                            ) // 연결 상태가 모두 체크된 경우에만 가능
                          }
                          disabled={
                            !clusterVoList.every(
                              (cluster) => cluster.isConnected
                            )
                          } // 연결 상태가 아닌 경우 비활성화
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setClusterVoList((prevState) =>
                              prevState.map((cluster) => ({
                                ...cluster,
                                isRequired: isChecked, // "모두 필요" 상태 설정
                              }))
                            );
                          }}
                        />
                        <label htmlFor="require_all"> 모두 필요</label>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clusterVoList.map((cluster, index) => (
                    <tr key={cluster.id}>
                      <td>
                        {cluster.name} / {cluster.id}{" "}
                      </td>
                      <td>
                        <div className="flex">
                          <input
                            type="checkbox"
                            id={`connect_${cluster.id}`}
                            checked={cluster.isConnected} // 연결 상태
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setClusterVoList((prevState) =>
                                prevState.map((c, i) =>
                                  i === index
                                    ? {
                                        ...c,
                                        isConnected: isChecked,
                                        isRequired: isChecked
                                          ? c.isRequired
                                          : false,
                                      } // 연결 해제 시 필수 상태도 해제
                                    : c
                                )
                              );
                            }}
                          />
                          <label htmlFor={`connect_${cluster.id}`}>
                            {" "}
                            연결
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="flex">
                          <input
                            type="checkbox"
                            id={`require_${cluster.id}`}
                            checked={cluster.isRequired} // 필수 상태
                            disabled={!cluster.isConnected} // 연결 상태가 체크되지 않으면 비활성화
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setClusterVoList((prevState) =>
                                prevState.map((c, i) =>
                                  i === index
                                    ? { ...c, isRequired: isChecked }
                                    : c
                                )
                              );
                            }}
                          />
                          <label htmlFor={`require_${cluster.id}`}>
                            {" "}
                            필수
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    
    </BaseModal>
  );
};

export default NetworkModal;
