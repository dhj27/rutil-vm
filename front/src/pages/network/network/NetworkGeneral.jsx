import React from "react";
import { useNetwork } from "../../../api/RQHook";
import InfoTable from "../../../components/table/InfoTable";
import Localization from "../../../utils/Localization";

/**
 * @name NetworkGeneral
 * @description 네트워크 일반정보
 *
 * @prop {string} networkId 네트워크 ID
 * @returns {JSX.Element} NetworkGeneral
 */
const NetworkGeneral = ({ networkId }) => {
  const { data: network } = useNetwork(networkId);

  const tableRows = [
    { label: Localization.kr.NAME, value: network?.name },
    { label: "ID", value: network?.id },
    { label: Localization.kr.DESCRIPTION, value: network?.description },
    { label: "VDSM 이름", value: network?.vdsmName },
    { label: `${Localization.kr.VM} 네트워크`, value: network?.usage?.vm ? Localization.kr.YES : Localization.kr.NO },
    { label: "VLAN 태그", value: network?.vlan === 0 ? "없음" : network?.vlan },
    { label: "MTU", value: network?.mtu === 0 ? "기본값 (1500)" : network?.mtu },
  ];

  return <InfoTable tableRows={tableRows} />;
};

export default NetworkGeneral;
